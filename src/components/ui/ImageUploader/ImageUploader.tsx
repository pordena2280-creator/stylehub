import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../../services/supabase';
import './ImageUploader.css';

// ============================================================
// TIPOS
// ============================================================
type Bucket = 'product-images' | 'category-images' | 'blog-images' | 'banner-images' | 'avatars';

interface ImageUploaderProps {
  /** URL actual de la imagen (para mostrar preview inicial) */
  currentUrl?: string | null;
  /** Bucket de Supabase Storage donde se sube */
  bucket: Bucket;
  /** Carpeta dentro del bucket, ej: "products" → products/filename.jpg */
  folder?: string;
  /** Callback cuando la imagen se sube con éxito — devuelve la URL pública */
  onUpload: (url: string) => void;
  /** Texto de ayuda para el uploader */
  label?: string;
  /** Tamaño máximo en MB (default 5) */
  maxSizeMB?: number;
}

// ============================================================
// COMPONENTE
// ============================================================
const ImageUploader = ({
  currentUrl,
  bucket,
  folder = '',
  onUpload,
  label = 'Imagen',
  maxSizeMB = 5,
}: ImageUploaderProps) => {
  const [preview, setPreview]   = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview al abrir modal de edición
  useEffect(() => {
    setPreview(currentUrl || null);
    setError(null);
  }, [currentUrl]);

  // ── Validar y subir el archivo ──────────────────────────────
  const upload = useCallback(async (file: File) => {
    setError(null);

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen (JPG, PNG, WebP, GIF).');
      return;
    }

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen no puede pesar más de ${maxSizeMB} MB.`);
      return;
    }

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const ext      = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path     = folder ? `${folder}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      // URL pública sin cache-bust para almacenar en la base de datos
      const publicUrl = data.publicUrl;
      // Para preview instantáneo añadimos parámetro temporal, pero NO lo guardamos
      setPreview(`${publicUrl}?t=${Date.now()}`);
      onUpload(publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir la imagen';
      setError(msg);
      // Revertir preview al original si falló
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  }, [bucket, folder, maxSizeMB, onUpload, currentUrl]);

  // ── Handlers ───────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }, [upload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onUpload('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="img-uploader">
      <p className="img-uploader-label">{label}</p>

      {/* Zona de drop / preview */}
      {preview ? (
        <div className="img-uploader-preview">
          <img src={preview} alt="Preview" className="img-uploader-img" />
          {uploading && (
            <div className="img-uploader-progress-overlay">
              <div className="img-uploader-spinner" />
              <span>Subiendo…</span>
            </div>
          )}
          {!uploading && (
            <div className="img-uploader-preview-actions">
              <button
                type="button"
                className="img-uploader-btn-change"
                onClick={() => inputRef.current?.click()}
                title="Cambiar imagen"
              >
                <i className="fa-solid fa-arrows-rotate" />
                Cambiar
              </button>
              <button
                type="button"
                className="img-uploader-btn-remove"
                onClick={handleRemove}
                title="Eliminar imagen"
              >
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`img-uploader-drop ${dragging ? 'drag-over' : ''} ${uploading ? 'is-uploading' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Subir imagen"
        >
          {uploading ? (
            <>
              <div className="img-uploader-spinner big" />
              <p className="img-uploader-drop-text">Subiendo imagen…</p>
            </>
          ) : (
            <>
              <div className="img-uploader-icon">
                <i className="fa-solid fa-cloud-arrow-up" />
              </div>
              <p className="img-uploader-drop-title">
                {dragging ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
              </p>
              <p className="img-uploader-drop-sub">
                JPG, PNG, WebP · máx. {maxSizeMB} MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="img-uploader-input"
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && (
        <div className="img-uploader-error">
          <i className="fa-solid fa-circle-exclamation" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
