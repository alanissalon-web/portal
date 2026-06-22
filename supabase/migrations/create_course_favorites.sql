-- Crear tabla para los cursos favoritos de los estudiantes
CREATE TABLE IF NOT EXISTS course_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Habilitar RLS
ALTER TABLE course_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Students can view their own course favorites" ON course_favorites;
DROP POLICY IF EXISTS "Students can insert their own course favorites" ON course_favorites;
DROP POLICY IF EXISTS "Students can delete their own course favorites" ON course_favorites;

CREATE POLICY "Students can view their own course favorites"
  ON course_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own course favorites"
  ON course_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their own course favorites"
  ON course_favorites FOR DELETE
  USING (auth.uid() = user_id);
