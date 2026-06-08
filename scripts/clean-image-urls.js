#!/usr/bin/env node
/*
  Script para limpiar query params (p.ej. ?t=...) de las URLs de imagen
  Usa las variables de entorno SUPABASE_URL y SUPABASE_KEY (clave de servicio o anon)

  Ejecución (PowerShell):
    $env:SUPABASE_URL='https://xyz.supabase.co'; $env:SUPABASE_KEY='your_key'; node scripts/clean-image-urls.js

  Ejecución (Unix):
    SUPABASE_URL=https://xyz.supabase.co SUPABASE_KEY=your_key node scripts/clean-image-urls.js
*/

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Debes exportar SUPABASE_URL y SUPABASE_KEY antes de ejecutar este script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const cleanUrl = (s) => {
  if (!s) return s;
  const parts = s.split('?');
  return parts[0];
};

async function cleanSimpleField(table, idField, fieldName) {
  console.log(`\n→ Limpiando ${table}.${fieldName}...`);
  const { data, error } = await supabase.from(table).select(`${idField}, ${fieldName}`);
  if (error) { console.error(`Error leyendo ${table}:`, error.message); return; }
  let updated = 0;
  for (const row of data) {
    const val = row[fieldName];
    if (!val) continue;
    const cleaned = cleanUrl(val);
    if (cleaned !== val) {
      const { error: upErr } = await supabase.from(table).update({ [fieldName]: cleaned }).eq(idField, row[idField]);
      if (upErr) console.error(`  Error actualizando ${table} id=${row[idField]}:`, upErr.message);
      else updated++;
    }
  }
  console.log(`  ${updated} filas actualizadas en ${table}.${fieldName}`);
}

async function cleanArrayField(table, idField, fieldName) {
  console.log(`\n→ Limpiando arrays ${table}.${fieldName}...`);
  const { data, error } = await supabase.from(table).select(`${idField}, ${fieldName}`);
  if (error) { console.error(`Error leyendo ${table}:`, error.message); return; }
  let updated = 0;
  for (const row of data) {
    const arr = row[fieldName];
    if (!arr || !Array.isArray(arr)) continue;
    const cleaned = arr.map(item => cleanUrl(item)).filter(Boolean);
    const same = JSON.stringify(cleaned) === JSON.stringify(arr);
    if (!same) {
      const { error: upErr } = await supabase.from(table).update({ [fieldName]: cleaned }).eq(idField, row[idField]);
      if (upErr) console.error(`  Error actualizando ${table} id=${row[idField]}:`, upErr.message);
      else updated++;
    }
  }
  console.log(`  ${updated} filas actualizadas en ${table}.${fieldName}`);
}

(async () => {
  try {
    // Tablas comunes en este proyecto
    await cleanSimpleField('categories', 'id', 'image_url');
    await cleanSimpleField('banners', 'id', 'image_url');
    await cleanSimpleField('cms_content', 'section_key', 'image_url');
    await cleanSimpleField('blog_posts', 'id', 'image_url');
    await cleanSimpleField('profiles', 'id', 'avatar_url');

    // Arrays
    await cleanArrayField('products', 'id', 'images');

    // product_variants puede tener images también
    await cleanArrayField('product_variants', 'id', 'images');

    console.log('\n✅ Limpieza completada. Revisa los cambios en Supabase.');
  } catch (err) {
    console.error('Error inesperado:', err.message || err);
  }
})();
