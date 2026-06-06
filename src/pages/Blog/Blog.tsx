import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService } from '../../services/blogService';
import { useCmsSection } from '../../hooks/useCmsSection';
import Seo from '../../components/seo/Seo';
import type { BlogPost } from '../../types';
import './Blog.css';

const Blog = () => {
  const { section: cms } = useCmsSection('blog_intro');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [recent, setRecent] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [res, recentPosts] = await Promise.all([
          blogService.getPosts(page, 6),
          blogService.getRecentPosts(3),
        ]);
        if (!cancelled) {
          setPosts(res.data);
          setTotalPages(res.totalPages);
          setRecent(recentPosts);
        }
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page]);

  const formatDate = (d?: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="blog-page">
      <Seo
        title="Blog — Noticias y Tendencias"
        description={cms?.description || 'Artículos, guías y noticias sobre tecnología y tendencias del mercado.'}
        canonicalUrl="/blog"
      />
      <section className="blog-hero">
        <div className="container">
          <div className="hero-content">
            <h1>{cms?.title || 'Nuestro Blog'}</h1>
            <p>{cms?.description || 'Mantente actualizado con las últimas noticias, guías y tendencias tecnológicas'}</p>
            <div className="breadcrumb">
              <Link to="/">Inicio</Link>
              <span>/</span>
              <span>Blog</span>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-content">
        <div className="container">
          <div className="blog-layout">
            <div className="blog-main">
              {loading ? (
                <p>Cargando artículos…</p>
              ) : posts.length === 0 ? (
                <p>No hay artículos publicados. Crea posts desde el panel Admin → Blog.</p>
              ) : (
                <div className="blog-grid">
                  {posts.map(post => (
                    <article key={post.id} className="blog-card">
                      <Link to={`/blog/${post.id}`} className="blog-image">
                        <img
                          src={post.image_url || '/images/blog/blog-1.jpg'}
                          alt={post.title}
                        />
                        <span className="blog-category">{post.category}</span>
                      </Link>
                      <div className="blog-card-content">
                        <div className="blog-meta">
                          <span className="author">
                            <i className="fa-solid fa-user" />
                            {(post.author as { full_name?: string })?.full_name || 'Equipo StyleHub'}
                          </span>
                          <span className="date">
                            <i className="fa-regular fa-calendar" />
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                        </div>
                        <h2 className="blog-title">
                          <Link to={`/blog/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p className="blog-excerpt">{post.excerpt || post.content.slice(0, 160)}…</p>
                        <Link to={`/blog/${post.id}`} className="read-more">
                          Leer más <i className="fa-solid fa-arrow-right" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    className="page-btn prev"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <i className="fa-solid fa-arrow-left" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="page-btn next"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </div>
              )}
            </div>

            <aside className="blog-sidebar">
              <div className="sidebar-widget">
                <h3>Recientes</h3>
                <ul>
                  {recent.map(r => (
                    <li key={r.id}>
                      <Link to={`/blog/${r.id}`}>{r.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
