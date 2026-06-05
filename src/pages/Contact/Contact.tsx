import { useState } from 'react';
import { useCmsSection } from '../../hooks/useCmsSection';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import Seo from '../../components/seo/Seo';
import './Contact.css';

const Contact = () => {
  const { section: cms } = useCmsSection('contact_hero');
  const { settings } = useStoreSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se implementará el envío del formulario
    console.log('Form submitted:', formData);
    alert('¡Mensaje enviado! Te contactaremos pronto.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="tf-contact-page">
      <Seo
        title="Contacto"
        description="Contáctanos por email, teléfono o formulario. Atención al cliente disponible lunes a viernes 9AM-6PM."
        canonicalUrl="/contact"
      />
      {/* Hero Section */}
      <section className="tf-contact-hero">
        <div className="container">
          <h1>{cms?.title || 'Contáctanos'}</h1>
          <p>{cms?.description || 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.'}</p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="tf-contact-content">
        <div className="container">
          <div className="row">
            {/* Contact Information */}
            <div className="col-lg-4">
              <div className="tf-contact-info-section">
                <h2>Información de Contacto</h2>
                <p className="tf-contact-intro">
                  Puedes contactarnos a través de cualquiera de estos medios. 
                  Estamos disponibles de lunes a viernes de 9:00 AM a 6:00 PM.
                </p>

                <div className="tf-contact-info-item">
                  <div className="tf-contact-info-icon">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="tf-contact-info-content">
                    <h4>Dirección</h4>
                    <p>
                      {settings?.store_address || '123 Calle Principal'}
                      <br />
                      {[settings?.store_city, settings?.store_state, settings?.store_zip_code].filter(Boolean).join(', ') || 'Ciudad, Estado'}
                    </p>
                  </div>
                </div>

                <div className="tf-contact-info-item">
                  <div className="tf-contact-info-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="tf-contact-info-content">
                    <h4>Teléfono</h4>
                    <p>
                      <a href={`tel:${settings?.contact_phone || settings?.store_phone || ''}`}>
                        {settings?.contact_phone || settings?.store_phone || '+1 (800) 123-4567'}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="tf-contact-info-item">
                  <div className="tf-contact-info-icon">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div className="tf-contact-info-content">
                    <h4>Email</h4>
                    <p>
                      <a href={`mailto:${settings?.contact_email || settings?.store_email || 'soporte@tienda.com'}`}>
                        {settings?.contact_email || settings?.store_email || 'soporte@tienda.com'}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="tf-contact-info-item">
                  <div className="tf-contact-info-icon">
                    <i className="fa-solid fa-clock"></i>
                  </div>
                  <div className="tf-contact-info-content">
                    <h4>Horario</h4>
                    <p>
                      Lunes - Viernes: 9:00 AM - 6:00 PM<br />
                      Sábado: 10:00 AM - 4:00 PM<br />
                      Domingo: Cerrado
                    </p>
                  </div>
                </div>

                <div className="tf-contact-social-media">
                  <h4>Síguenos</h4>
                  <div className="tf-contact-social-links">
                    <a href="#" className="tf-contact-social-link">
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                    <a href="#" className="tf-contact-social-link">
                      <i className="fa-brands fa-x-twitter"></i>
                    </a>
                    <a href="#" className="tf-contact-social-link">
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a href="#" className="tf-contact-social-link">
                      <i className="fa-brands fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-8">
              <div className="tf-contact-form-section">
                <h2>Envíanos un Mensaje</h2>
                <p className="tf-contact-form-intro">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>

                <form onSubmit={handleSubmit} className="tf-contact-form">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="tf-contact-form-group">
                        <label htmlFor="name">Nombre Completo *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="tf-contact-form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tf-contact-form-group">
                    <label htmlFor="subject">Asunto *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div className="tf-contact-form-group">
                    <label htmlFor="message">Mensaje *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Escribe tu mensaje aquí..."
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="tf-contact-map-section">
        <div className="container">
          <h2 className="tf-contact-map-title">Encuéntranos</h2>
          <div className="tf-contact-map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648750455!2d-73.98784368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="tf-contact-faq-links-section">
        <div className="container">
          <h2>¿Tienes Preguntas?</h2>
          <p>Consulta nuestras preguntas frecuentes o contáctanos directamente</p>
          <div className="tf-contact-faq-buttons">
            <a href="/faq" className="btn btn-primary">Ver Preguntas Frecuentes</a>
            <a href="tel:+18001234567" className="btn btn-outline">Llamar Ahora</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;