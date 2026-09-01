"""TCM drug compatibility safety checker — 十八反 / 十九畏 / 孕妇禁忌 / 剂量异常."""

import re

# 十八反：以下药对不能同用
_EIGHTEEN_INCOMPATIBLE: list[tuple[str, str]] = [
    # 甘草反
    ("甘草", "甘遂"),
    ("甘草", "大戟"),
    ("甘草", "海藻"),
    ("甘草", "芫花"),
    # 乌头反
    ("川乌", "贝母"),
    ("草乌", "贝母"),
    ("附子", "贝母"),
    ("川乌", "瓜蒌"),
    ("草乌", "瓜蒌"),
    ("附子", "瓜蒌"),
    ("川乌", "半夏"),
    ("草乌", "半夏"),
    ("附子", "半夏"),
    ("川乌", "白蔹"),
    ("草乌", "白蔹"),
    ("附子", "白蔹"),
    ("川乌", "白及"),
    ("草乌", "白及"),
    ("附子", "白及"),
    # 藜芦反
    ("藜芦", "人参"),
    ("藜芦", "丹参"),
    ("藜芦", "玄参"),
    ("藜芦", "沙参"),
    ("藜芦", "苦参"),
    ("藜芦", "细辛"),
    ("藜芦", "芍药"),
    ("藜芦", "白芍"),
    ("藜芦", "赤芍"),
]

# 十九畏：以下药对相互为畏，不宜同用
_NINETEEN_FEARED: list[tuple[str, str]] = [
    ("硫黄", "朴硝"),
    ("水银", "砒霜"),
    ("狼毒", "密陀僧"),
    ("巴豆", "牵牛"),
    ("丁香", "郁金"),
    ("川乌", "犀角"),
    ("草乌", "犀角"),
    ("牙硝", "三棱"),
    ("官桂", "石脂"),
    ("人参", "五灵脂"),
]

# 孕妇禁用药
_PREGNANT_FORBIDDEN: set[str] = {
    "麝香", "水蛭", "虻虫", "三棱", "莪术", "巴豆", "牵牛子",
    "商陆", "蜈蚣", "斑蝥", "砒霜", "雄黄",
}

# 孕妇慎用药
_PREGNANT_CAUTION: set[str] = {
    "附子", "半夏", "大黄", "桃仁", "红花", "枳实",
    "干姜", "肉桂", "川牛膝", "薏苡仁", "冬葵子",
}

# 常见草药剂量上限 (g)
_DOSE_LIMITS: dict[str, float] = {
    "黄连": 15,
    "附子": 30,
    "细辛": 6,
    "川乌": 9,
    "草乌": 9,
    "马钱子": 0.6,
    "巴豆": 0.1,
    "雄黄": 0.05,
    "砒霜": 0.002,
    "朱砂": 0.5,
    "蟾酥": 0.015,
    "斑蝥": 0.03,
    "全蝎": 6,
    "蜈蚣": 3,
    "水蛭": 10,
}


def check_safety(herbs: list[str]) -> list[str]:
    """Check herb list for 十八反/十九畏/孕妇禁忌 conflicts.

    Args:
        herbs: List of herb names (e.g. ["酸枣仁", "甘草", "半夏"]).

    Returns:
        List of warning strings with category prefix tags, empty if no conflicts.
    """
    herb_set = set(h.strip() for h in herbs if h.strip())
    warnings: list[str] = []

    for a, b in _EIGHTEEN_INCOMPATIBLE:
        if a in herb_set and b in herb_set:
            warnings.append(f"[十八反] {a} × {b} — 相反禁忌，不宜同用")

    for a, b in _NINETEEN_FEARED:
        if a in herb_set and b in herb_set:
            warnings.append(f"[十九畏] {a} × {b} — 相畏，不宜同用")

    for herb in herb_set:
        if herb in _PREGNANT_FORBIDDEN:
            warnings.append(f"[孕妇禁用] {herb} — 孕妇禁用药物，请谨慎")
        elif herb in _PREGNANT_CAUTION:
            warnings.append(f"[孕妇慎用] {herb} — 孕妇慎用药物")

    return warnings


def check_safety_with_doses(herb_dose_pairs: list[tuple[str, float]]) -> list[str]:
    """Check herb+dose pairs for dosage anomalies.

    Args:
        herb_dose_pairs: List of (herb_name, dose_g) tuples.

    Returns:
        List of dosage warning strings.
    """
    warnings: list[str] = []
    for herb, dose in herb_dose_pairs:
        limit = _DOSE_LIMITS.get(herb)
        if limit is not None and dose > limit:
            warnings.append(f"[剂量异常] {herb} {dose}g — 常用剂量上限 ≤ {limit}g，请核查")
    return warnings


def extract_herbs_from_ingredients(ingredients_str: str) -> list[str]:
    """Parse herb names from ingredients string (顿号/逗号/空格 separated)."""
    return [h.strip() for h in re.split(r"[、，,\s]+", ingredients_str) if h.strip()]


def extract_herb_dose_pairs(ingredients_str: str) -> list[tuple[str, float]]:
    """Extract (herb, dose_g) pairs from strings like '黄连6g、附子15g'.

    Returns only pairs where a numeric dose was found.
    """
    pairs: list[tuple[str, float]] = []
    # Match patterns: 药名数字g, 药名 数字g, 药名：数字g
    pattern = re.compile(r"([一-鿿]+)\s*[：:]?\s*(\d+(?:\.\d+)?)\s*g", re.IGNORECASE)
    for m in pattern.finditer(ingredients_str):
        herb, dose = m.group(1), float(m.group(2))
        pairs.append((herb, dose))
    return pairs
