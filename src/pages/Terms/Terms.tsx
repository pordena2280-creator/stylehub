import { Link } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <span>Términos y Condiciones</span>
          </div>
        </div>
      </section>

      <section className="terms-content">
        <div className="container">
          <h1>Términos y Condiciones</h1>
          
          <div className="terms-content-wrapper">
            <h2>1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar este sitio web, usted acepta estar sujeto a los siguientes términos y condiciones ("Términos"), así como a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, está prohibido utilizar o acceder a este sitio. Los materiales contenidos en este sitio web están protegidos por las leyes aplicables de derecho de autor y marca registrada.</p>
            
            <h2>2. Uso del Sitio</h2>
            <p>Se le concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de StyleHub para visualización transitoria personal y no comercial únicamente. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puede:</p>
            <ul>
              <li>modificar o copiar los materiales;</li>
              <li>utilizar los materiales para cualquier propósito comercial o para exhibición pública (comercial o no comercial);</li>
              <li>intentar descompilar o hacer ingeniería inversa de cualquier software contenido en el sitio web de TechStore;</li>
              <li>eliminar cualquier aviso de derechos de autor u otras notaciones de propiedad de los materiales; o</li>
              <li>transferir los materiales a otra persona o "espejar" los materiales en cualquier otro servidor.</li>
            </ul>
            
            <h2>3. Descargo de Responsabilidad</h2>
            <p>Los materiales en el sitio web de TechStore se proporcionan "tal cual". TechStore no ofrece garantías, ya sean expresas o implícitas, y por lo tanto niega y anula todas las demás garantías incluyendo, sin limitación, garantías implícitas o condiciones de comercialidad, idoneidad para un propósito particular, o no violación de la propiedad intelectual u otra violación de derechos.</p>
            <p>Además, TechStore no garantiza ni hace ninguna representación con respecto a la exactitud, los resultados probables o la fiabilidad del uso de los materiales en su sitio web o de otro modo relacionado con dichos materiales o en ningún sitio vinculado a este sitio.</p>
            
            <h2>4. Limitaciones</h2>
            <p>En ningún caso TechStore o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a interrupción del negocio) que surja del uso o la incapacidad de utilizar los materiales en el sitio web de TechStore, incluso si TechStore o un representante autorizado de TechStore ha sido notificado oralmente o por escrito de la posibilidad de dicho daño. Debido a que algunas jurisdicciones no permiten limitaciones en las garantías implícitas, o limitaciones de responsabilidad por daños consecuentes o incidentales, estas limitaciones pueden no aplicarle a usted.</p>
            
            <h2>5. Exactitud de los materiales</h2>
            <p>Los materiales que aparecen en el sitio web de TechStore pueden incluir errores técnicos, tipográficos o fotográficos. TechStore no garantiza que ninguno de los materiales en su sitio web sea preciso, completo o actual. TechStore puede realizar cambios en los materiales contenidos en su sitio web en cualquier momento sin previo aviso. TechStore, sin embargo, no se compromete a actualizar los materiales.</p>
            
            <h2>6. Enlaces</h2>
            <p>TechStore no ha revisado todos los sitios vinculados a su sitio web y no es responsable del contenido de ningún sitio vinculado. La inclusión de cualquier enlace no implica el aval por parte de TechStore del sitio. El uso de cualquier sitio vinculado es bajo el propio riesgo del usuario.</p>
            
            <h2>7. Modificaciones</h2>
            <p>TechStore puede revisar estos términos y condiciones para su sitio web en cualquier momento sin previo aviso. Al utilizar este sitio web, usted acepta estar obligado por la versión entonces vigente de estos términos y condiciones.</p>
            
            <h2>8. Ley Aplicable</h2>
            <p>Estos términos y condiciones se rigen e interpretarán de acuerdo con las leyes de México y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales en dicho estado o ubicación.</p>
            
            <h2>9. Cambios en los Términos</h2>
            <p>TechStore se reserva el derecho, a su entera discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, proporcionaremos al menos 30 días de aviso antes de que los nuevos términos surtan efecto. Lo que constituye un cambio material será determinado a nuestra entera discreción.</p>
            
            <h2>10. Contáctenos</h2>
            <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos.</p>
          </div>
          
          <div className="terms-actions">
            <Link to="/" className="btn-back-home">
              <i className="fa-solid fa-home"></i> Volver al Inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;