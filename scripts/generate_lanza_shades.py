import json
import os

with open('/home/jason/.openclaw/workspaces/colorgenius/data/brands/lanza/shades.json') as f:
    data = json.load(f)

shades = data['shades']

tone_map = {
    'natural': 'N',
    'ash': 'A',
    'golden': 'G',
    'gold': 'G',
    'red': 'R',
    'violet': 'V',
    'beige': 'B',
    'mahogany': 'M',
    'chocolate': 'C',
    'pearl': 'P',
    'copper': 'K',
    'brown': 'N',
}

undertone_map = {
    'natural': 'neutral',
    'ash': 'cool',
    'golden': 'warm',
    'gold': 'warm',
    'red': 'warm',
    'violet': 'cool',
    'beige': 'warm',
    'mahogany': 'warm',
    'chocolate': 'warm',
    'pearl': 'cool',
    'copper': 'warm',
    'brown': 'neutral',
}

gray_map = {
    'excellent': 100,
    'good': 80,
    'moderate': 60,
    'poor': 40,
    'none': 0,
}

entries = []
for s in shades:
    code = s['code']
    tone_fam = s['toneFamily']
    tone = tone_map.get(tone_fam, 'N')
    level = s['level']
    # isHighLift: level 10+ with non-natural tone
    is_high = level >= 10 and tone not in ['N']
    # For NN codes, treat as natural
    if 'NN' in code:
        tone = 'N'
    undertone = undertone_map.get(tone_fam, 'neutral')
    gray = gray_map.get(s.get('grayCoverage', 'good'), 80)
    dev = s['developerVolume'][0] if s['developerVolume'] else 20
    is_natural = tone_fam == 'natural'
    is_mixing = s.get('isMixingBase', False)
    entries.append(f"  {{ brand:'Lanza Healing Color', productLine:'Healing Color', shadeCode:'{code}', name:'{s['name']}', level:{level}, tone:'{tone}', toneFamily:'{tone_fam}', isNatural:{'true' if is_natural else 'false'}, isHighLift:{'true' if is_high else 'false'}, isMixingShade:{'true' if is_mixing else 'false'}, rgb:[{s['rgb'][0]},{s['rgb'][1]},{s['rgb'][2]}], undertone:'{undertone}', maxGrayCoverage:{gray}, maxLift:0, developerDefault:{dev}, mixingRatio:'{s['mixRatio']}', baseProcessingMinutes:{s['processingTime']} }}")

print('\n'.join(entries))
