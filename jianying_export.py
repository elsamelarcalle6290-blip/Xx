import json
import os
import re
import shutil
import uuid
from datetime import datetime
from typing import Any, Iterable, Optional

from loguru import logger

from app.config import config
from app.utils import utils


def _safe_name(name: str) -> str:
    sanitized = re.sub(r'[<>:"/\\|?*]+', "_", name or "")
    sanitized = sanitized.strip().strip(".")
    return sanitized or "untitled"


def _copy_if_exists(src: str, dst_dir: str) -> Optional[str]:
    if not src or not os.path.exists(src):
        return None

    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, os.path.basename(src))
    shutil.copy2(src, dst)
    return dst


def _copy_resource(src_path: str, dst_dir: str) -> Optional[str]:
    if not src_path or not os.path.exists(src_path):
        return None
    os.makedirs(dst_dir, exist_ok=True)
    ext = os.path.splitext(src_path)[1]
    dst_path = os.path.join(dst_dir, f"{uuid.uuid4().hex}{ext}")
    shutil.copy2(src_path, dst_path)
    return dst_path


def _collect_existing(paths: Iterable[str]) -> list[str]:
    return [p for p in paths if p and os.path.exists(p)]


def _safe_uuid() -> str:
    return str(uuid.uuid4()).upper()


def _read_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as fp:
        return json.load(fp)


def _write_json(path: str, data: dict) -> None:
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=2)


def _normalize_path(value: str) -> str:
    return os.path.normpath(value).replace("\\", "/")


def _media_duration_us(path: str) -> int:
    try:
        from moviepy import VideoFileClip

        with VideoFileClip(path) as clip:
            if not clip.duration:
                return 0
            return int(float(clip.duration) * 1_000_000)
    except Exception as exc:
        logger.warning(f"无法读取视频时长，将沿用模板时长: {exc}")
        return 0


def _audio_duration_us(path: str) -> int:
    try:
        from pydub import AudioSegment

        audio = AudioSegment.from_file(path)
        return len(audio) * 1000
    except Exception as exc:
        logger.warning(f"无法读取音频时长，将沿用模板时长: {exc}")
        return 0


def _replace_placeholder_strings(value: Any, replacements: dict[str, str]) -> Any:
    if isinstance(value, dict):
        return {
            key: _replace_placeholder_strings(sub_value, replacements)
            for key, sub_value in value.items()
        }
    if isinstance(value, list):
        return [_replace_placeholder_strings(item, replacements) for item in value]
    if isinstance(value, str):
        updated = value
        for old, new in replacements.items():
            if old and old in updated:
                updated = updated.replace(old, new)
        return updated
    return value


def _iter_video_collections(draft_content: dict) -> list[list[dict]]:
    collections: list[list[dict]] = []
    materials = draft_content.get("materials", {})
    if isinstance(materials.get("videos"), list):
        collections.append(materials["videos"])

    for subdraft in materials.get("drafts", []) or []:
        draft = subdraft.get("draft", {})
        sub_materials = draft.get("materials", {})
        if isinstance(sub_materials.get("videos"), list):
            collections.append(sub_materials["videos"])

    return collections


def _update_video_items(video_items: list[dict], video_path: str, duration_us: int, project_name: str) -> None:
    local_material_id = str(uuid.uuid4()).lower()
    basename = os.path.basename(video_path)
    normalized_video_path = _normalize_path(video_path)

    for item in video_items:
        if item.get("type") != "video":
            continue

        item["path"] = normalized_video_path
        item["material_name"] = basename
        item["local_material_id"] = local_material_id
        item["local_id"] = ""
        item["material_id"] = ""
        item["category_name"] = "local"
        item["source"] = 0
        item["source_platform"] = 0
        item["is_copyright"] = False
        item["has_audio"] = True
        item["height"] = item.get("height") or 720
        item["width"] = item.get("width") or 1280
        item["extra_type_option"] = 0
        item["local_material_from"] = ""
        item["material_url"] = ""
        item["team_id"] = ""
        if duration_us > 0:
            item["duration"] = duration_us
            video_algorithm = item.setdefault("video_algorithm", {})
            video_algorithm["time_range"] = None
            stable = item.setdefault("stable", {})
            stable["time_range"] = {"duration": 0, "start": 0}

    for item in video_items:
        if item.get("type") == "video" and item.get("extra_type_option") == 2:
            item["material_name"] = project_name


def _update_track_segments(draft_data: dict, duration_us: int) -> None:
    if duration_us <= 0:
        return

    draft_data["duration"] = duration_us
    for track in draft_data.get("tracks", []) or []:
        for segment in track.get("segments", []) or []:
            source_range = segment.get("source_timerange")
            if isinstance(source_range, dict) and "duration" in source_range:
                source_range["duration"] = duration_us
                source_range.setdefault("start", 0)

            target_range = segment.get("target_timerange")
            if isinstance(target_range, dict) and "duration" in target_range:
                if target_range.get("start", 0) == 0:
                    target_range["duration"] = duration_us
                target_range.setdefault("start", 0)


def _prune_top_level_non_project_videos(draft_content: dict) -> None:
    videos = draft_content.get("materials", {}).get("videos", [])
    if not isinstance(videos, list):
        return

    draft_content["materials"]["videos"] = [
        item for item in videos
        if item.get("extra_type_option") == 2 or item.get("type") == "video"
    ]


def _parse_srt_time(value: str) -> int:
    match = re.match(r"(\d+):(\d+):(\d+),(\d+)", value.strip())
    if not match:
        return 0
    hours, minutes, seconds, millis = map(int, match.groups())
    total_ms = (((hours * 60) + minutes) * 60 + seconds) * 1000 + millis
    return total_ms * 1000


def _parse_srt_file(path: str) -> list[dict]:
    if not path or not os.path.exists(path):
        return []

    with open(path, "r", encoding="utf-8") as fp:
        content = fp.read().strip()

    blocks = re.split(r"\r?\n\r?\n", content)
    items: list[dict] = []
    for block in blocks:
        lines = [line.strip("\ufeff") for line in block.splitlines() if line.strip()]
        if len(lines) < 3 or " --> " not in lines[1]:
            continue
        start_str, end_str = lines[1].split(" --> ", 1)
        items.append(
            {
                "start": _parse_srt_time(start_str),
                "end": _parse_srt_time(end_str),
                "text": "\n".join(lines[2:]).strip(),
            }
        )
    return items


def _script_total_duration_us(script_list: list[dict]) -> int:
    if not script_list:
        return 0
    return int(sum(float(item.get("duration", 0) or 0) for item in script_list) * 1_000_000)


def _make_audio_material(audio_path: str, duration_us: int, name: str = "") -> dict:
    return {
        "ai_music_enter_from": "",
        "ai_music_generate_scene": 0,
        "ai_music_type": 0,
        "aigc_history_id": "",
        "aigc_item_id": "",
        "app_id": 0,
        "category_id": "",
        "category_name": "local",
        "check_flag": 1,
        "cloned_model_type": "",
        "copyright_limit_type": "none",
        "duration": duration_us,
        "effect_id": "",
        "formula_id": "",
        "id": _safe_uuid(),
        "intensifies_path": "",
        "is_ai_clone_tone": False,
        "is_ai_clone_tone_post": False,
        "is_text_edit_overdub": False,
        "is_ugc": False,
        "local_material_id": str(uuid.uuid4()).lower(),
        "lyric_type": 0,
        "mock_tone_speaker": "",
        "moyin_emotion": "",
        "music_id": "",
        "music_source": "",
        "name": name or os.path.basename(audio_path),
        "path": _normalize_path(audio_path),
        "pgc_id": "",
        "pgc_name": "",
        "query": "",
        "request_id": "",
        "resource_id": "",
        "search_id": "",
        "similiar_music_info": {"original_song_id": "", "original_song_name": ""},
        "sound_separate_type": "",
        "source_from": "",
        "source_platform": 0,
        "team_id": "",
        "text_id": "",
        "third_resource_id": "",
        "tone_category_id": "",
        "tone_category_name": "",
        "tone_effect_id": "",
        "tone_effect_name": "",
        "tone_emotion_name_key": "",
        "tone_emotion_role": "",
        "tone_emotion_scale": 0.0,
        "tone_emotion_selection": "",
        "tone_emotion_style": "",
        "tone_platform": "",
        "tone_second_category_id": "",
        "tone_second_category_name": "",
        "tone_speaker": "",
        "tone_type": "",
        "tts_benefit_info": {"benefit_amount": -1, "benefit_log_extra": "", "benefit_log_id": "", "benefit_type": "none"},
        "tts_generate_scene": "",
        "tts_task_id": "",
        "type": "extract_audio",
        "video_id": "",
        "wave_points": [],
    }


def _make_text_material(text: str) -> dict:
    style_content = json.dumps(
        {
            "text": text,
            "styles": [
                {
                    "fill": {
                        "content": {
                            "render_type": "solid",
                            "solid": {"color": [1, 1, 1]},
                        }
                    },
                    "font": {"path": "F:/剪映/JianyingPro/10.2.0.13877/Resources/Font/SystemFont/zh-hans.ttf", "id": ""},
                    "size": 15,
                    "range": [0, max(len(text), 1)],
                }
            ],
        },
        ensure_ascii=False,
    )
    return {
        "add_type": 0,
        "alignment": 1,
        "background_alpha": 1.0,
        "background_color": "",
        "background_fill": "",
        "background_height": 0.14,
        "background_horizontal_offset": 0.0,
        "background_round_radius": 0.0,
        "background_style": 0,
        "background_vertical_offset": 0.0,
        "background_width": 0.14,
        "base_content": "",
        "bold_width": 0.0,
        "border_alpha": 1.0,
        "border_color": "",
        "border_mode": 0,
        "border_width": 0.08,
        "caption_template_info": {"category_id": "", "category_name": "", "effect_id": "", "is_new": False, "path": "", "request_id": "", "resource_id": "", "resource_name": "", "source_platform": 0, "third_resource_id": ""},
        "check_flag": 7,
        "combo_info": {"text_templates": []},
        "content": style_content,
        "current_words": {"end_time": [], "start_time": [], "text": []},
        "cutoff_postfix": "",
        "enable_path_typesetting": False,
        "fixed_height": -1.0,
        "fixed_width": max(120.0, float(len(text) * 18)),
        "font_category_id": "",
        "font_category_name": "",
        "font_id": "",
        "font_name": "",
        "font_path": "F:/剪映/JianyingPro/10.2.0.13877/Resources/Font/SystemFont/zh-hans.ttf",
        "font_resource_id": "",
        "font_size": 15.0,
        "font_source_platform": 0,
        "font_team_id": "",
        "font_third_resource_id": "",
        "font_title": "none",
        "font_url": "",
        "fonts": [],
        "force_apply_line_max_width": False,
        "global_alpha": 1.0,
        "group_id": "",
        "has_shadow": False,
        "id": _safe_uuid(),
        "initial_scale": 1.0,
        "inner_padding": -1.0,
        "is_batch_replace": False,
        "is_lyric_effect": False,
        "is_rich_text": False,
        "is_words_linear": False,
        "italic_degree": 0,
        "ktv_color": "",
        "language": "",
        "layer_weight": 1,
        "letter_spacing": -0.35,
        "line_feed": 1,
        "line_max_width": 0.82,
        "line_spacing": 0.02,
        "lyric_group_id": "",
        "lyrics_template": {"category_id": "", "category_name": "", "effect_id": "", "panel": "", "path": "", "request_id": "", "resource_id": "", "resource_name": ""},
        "multi_language_current": "none",
        "name": "",
        "offset_on_path": 0.0,
        "oneline_cutoff": False,
        "operation_type": 0,
        "original_size": [],
        "preset_category": "",
        "preset_category_id": "",
        "preset_has_set_alignment": False,
        "preset_id": "",
        "preset_index": 0,
        "preset_name": "",
        "punc_model": "",
        "recognize_model": "",
        "recognize_task_id": "",
        "recognize_text": "",
        "recognize_type": 0,
        "relevance_segment": [],
        "shadow_alpha": 0.9,
        "shadow_angle": -45.0,
        "shadow_color": "",
        "shadow_distance": 5.0,
        "shadow_point": {"x": 0.6363961030678928, "y": -0.6363961030678928},
        "shadow_smoothing": 0.45,
        "shadow_thickness_projection_angle": 0.0,
        "shadow_thickness_projection_distance": 0.0,
        "shadow_thickness_projection_enable": False,
        "shape_clip_x": False,
        "shape_clip_y": False,
        "single_char_bg_alpha": 1.0,
        "single_char_bg_color": "",
        "single_char_bg_enable": False,
        "single_char_bg_height": 0.0,
        "single_char_bg_horizontal_offset": 0.0,
        "single_char_bg_round_radius": 0.3,
        "single_char_bg_vertical_offset": 0.0,
        "single_char_bg_width": 0.0,
        "source_from": "",
        "ssml_content": "",
        "style_name": "",
        "sub_template_id": -1,
        "sub_type": 0,
        "subtitle_keywords": None,
        "subtitle_keywords_config": None,
        "subtitle_template_original_fontsize": 0.0,
        "text_alpha": 1.0,
        "text_color": "#FFFFFF",
        "text_curve": None,
        "text_exceeds_path_process_type": 0,
        "text_loop_on_path": False,
        "text_preset_resource_id": "",
        "text_size": 30,
        "text_to_audio_ids": [],
        "text_typesetting_path_index": 0,
        "text_typesetting_paths": None,
        "text_typesetting_paths_file": "",
        "translate_original_text": "",
        "tts_auto_update": False,
        "type": "text",
        "typesetting": 0,
        "underline": False,
        "underline_offset": 0.22,
        "underline_width": 0.05,
        "use_effect_default_color": True,
        "words": {"end_time": [], "start_time": [], "text": []},
    }


def _make_audio_segment(material_id: str, duration_us: int) -> dict:
    return {
        "cartoon": False,
        "clip": None,
        "common_keyframes": [],
        "desc": "",
        "enable_adjust": False,
        "group_id": "",
        "id": _safe_uuid(),
        "intensifies_audio": False,
        "is_loop": False,
        "is_placeholder": False,
        "is_tone_modify": False,
        "keyframe_refs": [],
        "last_nonzero_volume": 1.0,
        "material_id": material_id,
        "raw_segment_id": "",
        "render_index": 1,
        "render_timerange": {"duration": 0, "start": 0},
        "reverse": False,
        "source": "segmentsourcenormal",
        "source_timerange": {"duration": duration_us, "start": 0},
        "speed": 1.0,
        "state": 0,
        "target_timerange": {"duration": duration_us, "start": 0},
        "template_id": "",
        "template_scene": "default",
        "track_attribute": 0,
        "track_render_index": 1,
        "visible": True,
        "volume": 1.0,
    }


def _make_text_segment(material_id: str, start_us: int, duration_us: int) -> dict:
    return {
        "caption_info": None,
        "cartoon": False,
        "clip": {
            "alpha": 1.0,
            "flip": {"horizontal": False, "vertical": False},
            "rotation": 0.0,
            "scale": {"x": 1.385714292526245, "y": 1.385714292526245},
            "transform": {"x": 0.0, "y": 0.764080205032882},
        },
        "color_correct_alg_result": "",
        "common_keyframes": [],
        "desc": "",
        "digital_human_template_group_id": "",
        "enable_adjust": False,
        "enable_adjust_mask": False,
        "enable_color_correct_adjust": False,
        "enable_color_curves": True,
        "enable_color_match_adjust": False,
        "enable_color_wheels": True,
        "enable_hsl": False,
        "enable_hsl_curves": True,
        "enable_lut": False,
        "enable_mask_shadow": False,
        "enable_mask_stroke": False,
        "enable_smart_color_adjust": False,
        "enable_video_mask": True,
        "extra_material_refs": [],
        "group_id": "",
        "hdr_settings": None,
        "id": _safe_uuid(),
        "intensifies_audio": False,
        "is_loop": False,
        "is_placeholder": False,
        "is_tone_modify": False,
        "keyframe_refs": [],
        "last_nonzero_volume": 1.0,
        "lyric_keyframes": None,
        "material_id": material_id,
        "raw_segment_id": "",
        "render_index": 14031,
        "render_timerange": {"duration": 0, "start": 0},
        "responsive_layout": {
            "enable": False,
            "horizontal_pos_layout": 0,
            "size_layout": 0,
            "target_follow": "",
            "vertical_pos_layout": 0,
        },
        "reverse": False,
        "source": "segmentsourcenormal",
        "source_timerange": None,
        "speed": 1.0,
        "state": 0,
        "target_timerange": {"duration": duration_us, "start": start_us},
        "template_id": "",
        "template_scene": "default",
        "track_attribute": 0,
        "track_render_index": 2,
        "uniform_scale": {"on": True, "value": 1.0},
        "visible": True,
        "volume": 1.0,
    }


def _rebuild_subdraft_tracks(
    subdraft: dict,
    video_path: str,
    audio_path: str,
    subtitle_path: str,
    script_list: list[dict],
    project_name: str,
) -> int:
    materials = subdraft.setdefault("materials", {})
    materials.setdefault("videos", [])
    materials.setdefault("audios", [])
    materials.setdefault("texts", [])

    video_duration_us = _media_duration_us(video_path)
    audio_duration_us = _audio_duration_us(audio_path) if audio_path else 0
    script_duration_us = _script_total_duration_us(script_list)
    timeline_duration_us = max(video_duration_us, audio_duration_us, script_duration_us)

    subtitle_items = _parse_srt_file(subtitle_path)

    for video_item in materials.get("videos", []):
        if video_item.get("type") == "video":
            _update_video_items([video_item], video_path, timeline_duration_us, project_name)

    if audio_path:
        materials["audios"] = [
            _make_audio_material(audio_path, audio_duration_us or timeline_duration_us, os.path.basename(audio_path))
        ]
    else:
        materials["audios"] = []

    materials["texts"] = [_make_text_material(item["text"]) for item in subtitle_items]

    video_material = next((item for item in materials.get("videos", []) if item.get("type") == "video"), None)
    audio_material = materials["audios"][0] if materials["audios"] else None

    tracks = []
    if video_material:
        tracks.append(
            {
                "attribute": 0,
                "flag": 0,
                "id": _safe_uuid(),
                "is_default_name": True,
                "name": "视频轨",
                "segments": [
                    {
                        "caption_info": None,
                        "cartoon": False,
                        "clip": {
                            "alpha": 1.0,
                            "flip": {"horizontal": False, "vertical": False},
                            "rotation": 0.0,
                            "scale": {"x": 1.0, "y": 1.0},
                            "transform": {"x": 0.0, "y": 0.0},
                        },
                        "color_correct_alg_result": "",
                        "common_keyframes": [],
                        "desc": "",
                        "digital_human_template_group_id": "",
                        "enable_adjust": True,
                        "enable_adjust_mask": False,
                        "enable_color_correct_adjust": False,
                        "enable_color_curves": True,
                        "enable_color_match_adjust": False,
                        "enable_color_wheels": True,
                        "enable_hsl": False,
                        "enable_hsl_curves": True,
                        "enable_lut": True,
                        "enable_mask_shadow": False,
                        "enable_mask_stroke": False,
                        "enable_smart_color_adjust": False,
                        "enable_video_mask": True,
                        "extra_material_refs": [],
                        "group_id": "",
                        "hdr_settings": {"intensity": 1.0, "mode": 1, "nits": 1000},
                        "id": _safe_uuid(),
                        "intensifies_audio": False,
                        "is_loop": False,
                        "is_placeholder": False,
                        "is_tone_modify": False,
                        "keyframe_refs": [],
                        "last_nonzero_volume": 1.0,
                        "lyric_keyframes": None,
                        "material_id": video_material["id"],
                        "raw_segment_id": "",
                        "render_index": 0,
                        "render_timerange": {"duration": 0, "start": 0},
                        "responsive_layout": {
                            "enable": False,
                            "horizontal_pos_layout": 0,
                            "size_layout": 0,
                            "target_follow": "",
                            "vertical_pos_layout": 0,
                        },
                        "reverse": False,
                        "source": "segmentsourcenormal",
                        "source_timerange": {"duration": timeline_duration_us, "start": 0},
                        "speed": 1.0,
                        "state": 0,
                        "target_timerange": {"duration": timeline_duration_us, "start": 0},
                        "template_id": "",
                        "template_scene": "default",
                        "track_attribute": 0,
                        "track_render_index": 0,
                        "uniform_scale": {"on": True, "value": 1.0},
                        "visible": True,
                        "volume": 1.0,
                    }
                ],
                "type": "video",
            }
        )

    if audio_material:
        tracks.append(
            {
                "attribute": 0,
                "flag": 0,
                "id": _safe_uuid(),
                "is_default_name": True,
                "name": "配音轨",
                "segments": [_make_audio_segment(audio_material["id"], audio_duration_us or timeline_duration_us)],
                "type": "audio",
            }
        )

    if subtitle_items:
        tracks.append(
            {
                "attribute": 0,
                "flag": 0,
                "id": _safe_uuid(),
                "is_default_name": True,
                "name": "字幕轨",
                "segments": [
                    _make_text_segment(material["id"], item["start"], max(item["end"] - item["start"], 100000))
                    for material, item in zip(materials["texts"], subtitle_items)
                ],
                "type": "text",
            }
        )

    subdraft["tracks"] = tracks
    subdraft["duration"] = timeline_duration_us
    return timeline_duration_us


def export_jianying_draft_project(
    task_id: str,
    final_video_paths: list[str],
    combined_video_paths: Optional[list[str]] = None,
    merged_audio_path: str = "",
    merged_subtitle_path: str = "",
    script_list: Optional[list[dict]] = None,
    draft_name: str = "",
) -> Optional[str]:
    enabled = bool(config.app.get("jianying_draft_enabled", False))
    draft_root = str(config.app.get("jianying_draft_root", "") or "").strip()
    template_dir = str(config.app.get("jianying_draft_template", "") or "").strip()
    preferred_template = str(config.app.get("jianying_draft_multitrack_template", "") or "").strip()
    if not enabled or not draft_root or not template_dir:
        logger.info("剪映草稿工程导出未启用，跳过")
        return None

    if preferred_template and os.path.isdir(os.path.normpath(preferred_template)):
        template_dir = preferred_template

    template_dir = os.path.normpath(template_dir)
    draft_root = os.path.normpath(draft_root)
    if not os.path.isdir(template_dir):
        logger.warning(f"剪映草稿模板目录不存在: {template_dir}")
        return None

    source_candidates = combined_video_paths or final_video_paths
    source_video = next((p for p in source_candidates if p and os.path.exists(p)), "")
    if not source_video:
        logger.warning("没有找到可用于生成剪映草稿工程的视频时间线")
        return None

    os.makedirs(draft_root, exist_ok=True)
    draft_folder_name = _safe_name(
        draft_name or f"NarratoAI_{datetime.now().strftime('%m月%d日_%H%M%S')}"
    )
    project_dir = os.path.join(draft_root, draft_folder_name)
    if os.path.exists(project_dir):
        shutil.rmtree(project_dir)
    shutil.copytree(template_dir, project_dir)

    resources_dir = os.path.join(project_dir, "Resources")
    os.makedirs(resources_dir, exist_ok=True)
    target_video_path = _copy_resource(source_video, resources_dir)
    target_audio_path = _copy_resource(merged_audio_path, resources_dir) if merged_audio_path else None
    if not target_video_path:
        logger.warning("视频时间线复制失败，无法生成剪映草稿工程")
        return None

    draft_content_path = os.path.join(project_dir, "draft_content.json")
    draft_meta_path = os.path.join(project_dir, "draft_meta_info.json")
    if not os.path.isfile(draft_content_path) or not os.path.isfile(draft_meta_path):
        logger.warning("剪映草稿模板缺少必要的 JSON 文件")
        return None

    draft_content = _read_json(draft_content_path)
    draft_meta = _read_json(draft_meta_path)

    duration_us = _media_duration_us(target_video_path)
    project_uuid = _safe_uuid()
    normalized_project_dir = _normalize_path(project_dir)
    normalized_draft_root = _normalize_path(draft_root)

    draft_content["id"] = project_uuid
    draft_content["create_time"] = 0
    draft_content["update_time"] = 0
    if duration_us > 0:
        draft_content["duration"] = duration_us

    replacements = {
        "##_presetpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##": normalized_project_dir,
        _normalize_path(template_dir): normalized_project_dir,
        template_dir.replace("\\", "/"): normalized_project_dir,
    }
    draft_content = _replace_placeholder_strings(draft_content, replacements)
    draft_meta = _replace_placeholder_strings(draft_meta, replacements)

    for collection in _iter_video_collections(draft_content):
        _update_video_items(collection, target_video_path, duration_us, draft_folder_name)

    _prune_top_level_non_project_videos(draft_content)
    _update_track_segments(draft_content, duration_us)

    for subdraft in draft_content.get("materials", {}).get("drafts", []) or []:
        subdraft_data = subdraft.get("draft", {})
        rebuilt_duration = _rebuild_subdraft_tracks(
            subdraft_data,
            target_video_path,
            target_audio_path or "",
            merged_subtitle_path,
            script_list or [],
            draft_folder_name,
        )
        _update_track_segments(subdraft_data, rebuilt_duration)
        if rebuilt_duration > 0:
            duration_us = max(duration_us, rebuilt_duration)
        subdraft_data["id"] = _safe_uuid()
        subdraft["id"] = _safe_uuid()
        subdraft["name"] = draft_folder_name
        subdraft["draft_file_path"] = f"{normalized_project_dir}/draft_content.json"
        subdraft["draft_cover_path"] = f"{normalized_project_dir}/draft_cover.jpg"
        subdraft["draft_config_path"] = f"{normalized_project_dir}/sub_draft_config.json"

    draft_content["duration"] = duration_us
    draft_meta["draft_name"] = draft_folder_name
    draft_meta["draft_fold_path"] = normalized_project_dir
    draft_meta["draft_root_path"] = normalized_draft_root
    draft_meta["draft_id"] = project_uuid
    draft_meta["draft_cover"] = "draft_cover.jpg"
    if duration_us > 0:
        draft_meta["tm_duration"] = duration_us

    _write_json(draft_content_path, draft_content)
    _write_json(draft_meta_path, draft_meta)

    logger.success(f"剪映草稿工程已导出: {project_dir}")
    return project_dir


def export_jianying_import_package(
    task_id: str,
    script_list: list[dict],
    final_video_paths: list[str],
    combined_video_paths: list[str],
    merged_audio_path: str = "",
    merged_subtitle_path: str = "",
    video_script_path: str = "",
) -> Optional[str]:
    enabled = bool(config.app.get("jianying_import_enabled", False))
    export_root = str(config.app.get("jianying_import_root", "") or "").strip()
    if not enabled or not export_root:
        logger.info("剪映导入包导出未启用，跳过")
        return None

    export_root = os.path.normpath(export_root)
    os.makedirs(export_root, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    package_name = _safe_name(f"NarratoAI_{task_id}_{timestamp}")
    package_dir = os.path.join(export_root, package_name)

    if os.path.exists(package_dir):
        shutil.rmtree(package_dir)
    os.makedirs(package_dir, exist_ok=True)

    finals_dir = os.path.join(package_dir, "01_成片")
    timeline_dir = os.path.join(package_dir, "02_时间线素材")
    segment_video_dir = os.path.join(package_dir, "03_分段视频")
    segment_audio_dir = os.path.join(package_dir, "04_分段音频")
    segment_subtitle_dir = os.path.join(package_dir, "05_分段字幕")
    scripts_dir = os.path.join(package_dir, "06_脚本")

    exported_finals = [
        _copy_if_exists(path, finals_dir) for path in _collect_existing(final_video_paths)
    ]
    exported_timelines = [
        _copy_if_exists(path, timeline_dir) for path in _collect_existing(combined_video_paths)
    ]
    exported_merged_audio = _copy_if_exists(merged_audio_path, timeline_dir)
    exported_merged_subtitle = _copy_if_exists(merged_subtitle_path, timeline_dir)
    exported_source_script = _copy_if_exists(video_script_path, scripts_dir)

    exported_segments: list[dict] = []
    for index, item in enumerate(script_list, start=1):
        exported_segments.append(
            {
                "index": index,
                "id": item.get("_id"),
                "timestamp": item.get("timestamp", ""),
                "sourceTimeRange": item.get("sourceTimeRange", ""),
                "editedTimeRange": item.get("editedTimeRange", ""),
                "duration": item.get("duration", 0),
                "narration": item.get("narration", ""),
                "picture": item.get("picture", ""),
                "OST": item.get("OST"),
                "video": _copy_if_exists(item.get("video", ""), segment_video_dir),
                "audio": _copy_if_exists(item.get("audio", ""), segment_audio_dir),
                "subtitle": _copy_if_exists(item.get("subtitle", ""), segment_subtitle_dir),
            }
        )

    final_script_path = os.path.join(scripts_dir, "final_script.json")
    os.makedirs(scripts_dir, exist_ok=True)
    with open(final_script_path, "w", encoding="utf-8") as fp:
        json.dump(exported_segments, fp, ensure_ascii=False, indent=2)

    manifest = {
        "task_id": task_id,
        "exported_at": datetime.now().isoformat(timespec="seconds"),
        "package_dir": package_dir,
        "source_task_dir": utils.task_dir(task_id),
        "final_videos": [p for p in exported_finals if p],
        "timeline_videos": [p for p in exported_timelines if p],
        "merged_audio": exported_merged_audio,
        "merged_subtitle": exported_merged_subtitle,
        "source_script": exported_source_script,
        "final_script": final_script_path,
        "segments": exported_segments,
    }

    manifest_path = os.path.join(package_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as fp:
        json.dump(manifest, fp, ensure_ascii=False, indent=2)

    readme_path = os.path.join(package_dir, "导入说明.txt")
    with open(readme_path, "w", encoding="utf-8") as fp:
        fp.write(
            "NarratoAI 剪映导入包\n\n"
            "1. 打开剪映专业版，新建草稿。\n"
            "2. 优先导入 02_时间线素材 中的视频和音频，也可直接使用剪映草稿工程导入结果。\n"
            "3. 需要更细分的微调时，再导入 03_分段视频、04_分段音频、05_分段字幕。\n"
            "4. 06_脚本 中保存了原始脚本和整理后的分段清单，方便对照修改。\n"
        )

    logger.success(f"剪映导入包已导出: {package_dir}")
    return package_dir
