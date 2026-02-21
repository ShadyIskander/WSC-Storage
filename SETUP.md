# WSC Storage Setup

If you're setting this up for the first time, here's the checklist. 

## 1. Get Supabase Ready
1.  Go to [supabase.com](https://supabase.com), make an account, and start a new project.
2.  Once the project is spinning, go to **Project Settings -> API**. 
3.  Copy the `URL` and the `anon key`.

## 2. Set up your local keys
In VS Code, create a file named `.env`. It should be in the root of your project (right next to `index.html`).
Paste your keys in like this:

```bash
VITE_SUPABASE_URL=paste_your_url_here
VITE_SUPABASE_ANON_KEY=paste_your_key_here
```

## 3. Database Table Structure
Go to the **SQL Editor** in Supabase and run this chunk of code. It creates the tables and sets up the security so the app can actually save data.

```sql
-- Create the main inventory table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  total_quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the record of every transaction
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  user_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  action_type TEXT CHECK (action_type IN ('take', 'return')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Security
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow the app to read/write/delete (safe with the anon key)
CREATE POLICY "Full Access" ON equipment FOR ALL USING (true);
CREATE POLICY "Full Access" ON transactions FOR ALL USING (true);
```

## 4. Bulk Load the Items
Don't bother adding these one by one. Paste this into the SQL Editor and run it to populate the warehouse instantly.

```sql
INSERT INTO equipment (name_en, name_ar, total_quantity, available_quantity, location) VALUES
('Canvas Tent (4-Person)', 'خيمة قماش (٤ أفراد)', 15, 15, 'Shelf A1'),
('Sleeping Bag', 'كيس نوم', 40, 40, 'Shelf A2'),
('Coleman Cooler (Large)', 'كولمان تبريد (كبير)', 8, 8, 'Shelf B1'),
('Camping Chair', 'كرسي تخييم', 25, 25, 'Shelf B2'),
('LED Lantern', 'فانوس ليد', 20, 20, 'Box C1'),
('First Aid Kit (XL)', 'شنطة إسعافات أولية', 5, 5, 'Office'),
('Nylon Rope (30m)', 'حبل نايلون (٣٠ متر)', 12, 12, 'Box C2'),
('Propane Stove', 'موقد بوتاجاز', 6, 6, 'Kitchen'),
('Cast Iron Skillet', 'مقلاة حديد', 10, 10, 'Kitchen'),
('Flashlight', 'كشاف يدوي', 30, 30, 'Box C1');
```

## Running it
1. `npm install`
2. `npm run dev`

Open `http://localhost:5173` and you're good. Admin password is `2003`.
