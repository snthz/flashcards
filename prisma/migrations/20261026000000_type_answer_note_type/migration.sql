INSERT INTO "NoteType" ("id", "userId", "name", "kind", "css", "fields", "templates", "updatedAt")
SELECT
    gen_random_uuid()::text,
    u."id",
    CASE WHEN u."locale" = 'es' THEN 'Básico (escribir la respuesta)' ELSE 'Basic (type in the answer)' END,
    'STANDARD',
    E'.card {\n  font-family: system-ui, -apple-system, sans-serif;\n  font-size: 22px;\n  text-align: center;\n  color: inherit;\n  background-color: transparent;\n}',
    CASE WHEN u."locale" = 'es'
        THEN '[{"name": "Anverso"}, {"name": "Reverso"}]'::jsonb
        ELSE '[{"name": "Front"}, {"name": "Back"}]'::jsonb
    END,
    CASE WHEN u."locale" = 'es'
        THEN jsonb_build_array(jsonb_build_object('name', 'Tarjeta 1', 'qfmt', E'{{Anverso}}\n\n{{type:Reverso}}', 'afmt', E'{{Anverso}}\n\n<hr id=answer>\n\n{{type:Reverso}}'))
        ELSE jsonb_build_array(jsonb_build_object('name', 'Card 1', 'qfmt', E'{{Front}}\n\n{{type:Back}}', 'afmt', E'{{Front}}\n\n<hr id=answer>\n\n{{type:Back}}'))
    END,
    CURRENT_TIMESTAMP
FROM "User" u
WHERE NOT EXISTS (
    SELECT 1 FROM "NoteType" nt
    WHERE nt."userId" = u."id"
      AND nt."name" IN ('Basic (type in the answer)', 'Básico (escribir la respuesta)')
);
