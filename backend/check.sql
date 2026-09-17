SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'document_chunks';
