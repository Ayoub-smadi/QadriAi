from pathlib import Path
import re

schema = Path('drizzle/schema.ts')
s = schema.read_text()
s = s.replace('from "drizzle-orm/mysql-core"', 'from "drizzle-orm/pg-core"')
s = s.replace('mysqlTable', 'pgTable')
s = s.replace('mysqlEnum', 'pgEnum')
s = s.replace('int(', 'integer(')
s = s.replace('json(', 'jsonb(')
s = s.replace('.onUpdateNow()', '')
# pgEnum is a factory: pgEnum("field", values) becomes pgEnum("field", values)("field")
s = re.sub(r'pgEnum\(("[^"]+"), (\[[^\]]+\])\)', r'pgEnum(\1, \2)(\1)', s)
# serial replaces integer autoincrement primary keys in PostgreSQL
s = re.sub(r'integer\(("[^"]+")\)\.autoincrement\(\)', r'serial(\1)', s)
s = s.replace('import { pgTable', 'import { pgTable')
# Ensure the required pg-core symbols are imported. Existing import is on line 1.
lines = s.splitlines()
if not lines[0].startswith('import {'):
    raise SystemExit('Unexpected schema import format')
imports = lines[0]
for name in ['pgTable', 'pgEnum', 'serial', 'integer', 'varchar', 'text', 'timestamp', 'jsonb', 'uniqueIndex', 'index']:
    if name not in imports:
        imports = imports[:-1] + ', ' + name + ' } from "drizzle-orm/pg-core"'
lines[0] = imports
schema.write_text('\n'.join(lines) + '\n')

config = Path('drizzle.config.ts')
c = config.read_text().replace('dialect: "mysql"', 'dialect: "postgresql"')
config.write_text(c)

pkg = Path('package.json')
p = pkg.read_text().replace('"mysql2": "^3.15.0",', '"pg": "^8.16.3",')
pkg.write_text(p)

# Convert the database adapter import and the Drizzle instance.
db = Path('server/db.ts')
d = db.read_text().replace('from "drizzle-orm/mysql2"', 'from "drizzle-orm/node-postgres"')
d = d.replace('drizzle(process.env.DATABASE_URL)', 'drizzle(process.env.DATABASE_URL)')
d = d.replace('.onDuplicateKeyUpdate({', '.onConflictDoUpdate({')
# The users upsert is the only duplicate-key call in the main db module.
d = d.replace('await db.insert(users).values(values).onConflictDoUpdate({\n    set: updateSet,', 'await db.insert(users).values(values).onConflictDoUpdate({\n    target: users.openId,\n    set: updateSet,')
# userProfiles upsert uses its unique userId index.
d = d.replace('await db.insert(userProfiles).values({ userId, ...profile }).onConflictDoUpdate({\n    set:', 'await db.insert(userProfiles).values({ userId, ...profile }).onConflictDoUpdate({\n    target: userProfiles.userId,\n    set:')
db.write_text(d)

# Convert the smaller auth database helper if it has an independent copy.
helper = Path('server/_core/db.ts')
if helper.exists():
    h = helper.read_text().replace('from "drizzle-orm/mysql2"', 'from "drizzle-orm/node-postgres"').replace('.onDuplicateKeyUpdate({', '.onConflictDoUpdate({')
    h = h.replace('await db.insert(users).values(values).onConflictDoUpdate({\n    set:', 'await db.insert(users).values(values).onConflictDoUpdate({\n    target: users.openId,\n    set:')
    helper.write_text(h)

# Remove stale MySQL lockfile package entries by regenerating after install.
print('Converted schema, drizzle config, database adapter, and package dependency.')
