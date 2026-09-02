from pathlib import Path
import re
p = Path('drizzle/schema.ts')
lines = p.read_text().splitlines()
current = None
out = []
for line in lines:
    m = re.match(r'export const (\w+) = pgTable\(', line)
    if m:
        current = m.group(1)
    if current:
        line = re.sub(r'pgEnum\("([^"]+)", (\[[^\]]+\])\)\("\1"\)', lambda m: f'pgEnum("{current}_{m.group(1)}_enum", {m.group(2)})("{m.group(1)}")', line)
    out.append(line)
p.write_text('\n'.join(out) + '\n')
print('Unique enum types generated per table and field.')
