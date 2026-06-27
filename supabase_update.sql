-- Script para añadir el campo "nombre" a la tabla "consultas" en Supabase.
-- Puedes ejecutar esto desde el SQL Editor de tu proyecto en Supabase.

ALTER TABLE "public"."consultas"
ADD COLUMN "nombre" text;

-- (Opcional) Si en el futuro necesitas que el campo nombre no sea nulo, 
-- puedes ejecutar lo siguiente después de rellenar los datos existentes:
-- ALTER TABLE "public"."consultas" ALTER COLUMN "nombre" SET NOT NULL;
