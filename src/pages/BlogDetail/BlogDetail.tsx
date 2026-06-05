import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogService } from '../../services/blogService';
import Seo from '../../components/seo/Seo';
import type { BlogPost } from '../../types';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const numId = Number(id);
        const data = Number.isNaN(numId)
          ? await blogService.getPostBySlug(id)
          : await blogService.getPostById(numId);
        if (!cancelled) setPost(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="blog-detail-page" style={{ padding: 48, textAlign: 'center' }}>
        Cargando artículo…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-detail-page" style={{ padding: 48, textAlign: 'center' }}>
        <h1>Artículo no encontrado</h1>
        <Link to="/blog">Volver al blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <Seo
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160)}
        imageUrl={post.image_url}
        canonicalUrl={`/blog/${post.id}`}
        ogType="article"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: `/blog/${post.id}` },
        ]}
      />
      <section className="blog-detail-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <span>{post.title}</span>
          </div>
          <h1>{post.title}</h1>
          <div className="blog-detail-meta">
            <span>{post.category}</span>
            <span>{formatDate(post.published_at || post.created_at)}</span>
            <span>{post.views || 0} vistas</span>
          </div>
        </div>
      </section>

      {post.image_url && (
        <div className="container" style={{ marginBottom: 24 }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 8 }}
          />
        </div>
      )}

      <section className="blog-detail-content">
        <div className="container">
          <div
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />
          <Link to="/blog" className="read-more" style={{ display: 'inline-block', marginTop: 32 }}>
            ← Volver al blog
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
