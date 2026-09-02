from pathlib import Path
import re
p = Path('drizzle/schema.ts')
s = p.read_text()
s = re.sub(r'pgEnum\("[^"]+", \[[^\]]+\]\)\("([^"]+)"\)', r'text("\1")', s)
s = s.replace('pgEnum, ', '').replace(', pgEnum', '')
p.write_text(s)
