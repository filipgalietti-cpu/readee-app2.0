import csv
import sys
import re

if len(sys.argv) < 3:
    print("Usage: python fix-other-grades-tts.py input.csv output.csv")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]

hint_fixes = 0
choice_fixes = 0

with open(input_file, 'r', newline='', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    header = next(reader)
    all_rows = list(reader)

with open(output_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    
    for row in all_rows:
        if len(row) < 3:
            writer.writerow(row)
            continue
        
        script = row[2]
        
        # Fix 1: Remove "Here's a hint!" from hints
        if "hint" in row[1].lower():
            for prefix in ["Here's a hint! ", "Here's a hint!"]:
                if prefix in script:
                    script = script.replace(prefix, "", 1)
                    hint_fixes += 1
                    break
        
        # Fix 2: Convert answer choices to natural flow
        if "hint" not in row[1].lower() and "What do you think?" in script:
            # Greedy approach: find last 4 "..." separated chunks before "What do you think?"
            # Pattern: ... C1 ... C2 ... C3 ... or C4? ... What do you think?
            match = re.search(
                r'(\.\.\.\s*)(.+?)\s+\.\.\.\s+(.+?)\s+\.\.\.\s+(.+?)\s+\.\.\.\s+or\s+(.+?)\?\s*\.\.\.\s*What do you think\?$',
                script
            )
            if match:
                c1 = match.group(2).strip()
                c2 = match.group(3).strip()
                c3 = match.group(4).strip()
                c4 = match.group(5).strip().rstrip('?')
                
                new_section = f"... Is it {c1}, {c2}, {c3}, or {c4}? ... What do you think?"
                script = script[:match.start()] + new_section
                choice_fixes += 1
        
        row[2] = script
        writer.writerow(row)

print(f"Processed {len(all_rows)} rows")
print(f"  Hint fixes: {hint_fixes}")
print(f"  Choice fixes: {choice_fixes}")
