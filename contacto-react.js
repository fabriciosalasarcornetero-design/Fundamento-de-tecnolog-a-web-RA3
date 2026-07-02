/**
 * Módulo de formulario interactivo (RA3)
 * Implementado con React (vía CDN, sin bundler) para cumplir con el requisito
 * de "Frameworks Front-End Avanzados: React y Gestión de Estado" de la guía.
 *
 * Componentes reutilizables:
 *  - FormField: input/textarea genérico con etiqueta, mensaje de error y soporte ARIA.
 *  - Button: botón con estado de carga.
 *  - Alert: mensaje de éxito/error dentro del propio formulario.
 *
 * Gestión de estado: useState (valores, errores, estado de envío) y
 * useEffect (validación reactiva mientras el usuario escribe, después del
 * primer intento de envío, y contador de caracteres del mensaje).
 */
const { useState, useEffect, useCallback } = React;

// ---------- Reglas de validación (reutilizables) ----------
const REGLAS = {
  nombre: (valor) => {
    if (!valor.trim()) return 'El nombre es obligatorio.';
    if (valor.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    return '';
  },
  email: (valor) => {
    if (!valor.trim()) return 'El correo electrónico es obligatorio.';
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patron.test(valor.trim())) return 'Ingresa un correo electrónico válido.';
    return '';
  },
  mensaje: (valor) => {
    if (!valor.trim()) return 'El mensaje es obligatorio.';
    if (valor.trim().length < 10) return 'Cuéntanos un poco más (mínimo 10 caracteres).';
    if (valor.trim().length > 500) return 'El mensaje no debe superar los 500 caracteres.';
    return '';
  },
};

// ---------- Componente reutilizable: campo de formulario ----------
function FormField({ id, label, type = 'text', as = 'input', value, onChange, onBlur, error, touched, placeholder, maxLength, helperText }) {
  const Tag = as; // 'input' o 'textarea'
  const mostrarError = Boolean(touched && error);

  return React.createElement(
    'div',
    { className: 'campo-react' },
    React.createElement('label', { htmlFor: id, className: 'campo-react-label' }, label),
    React.createElement(Tag, {
      id,
      name: id,
      type: as === 'input' ? type : undefined,
      className: `campo-react-input${mostrarError ? ' campo-react-input--error' : ''}`,
      value,
      placeholder,
      maxLength,
      onChange: (e) => onChange(id, e.target.value),
      onBlur: () => onBlur(id),
      'aria-invalid': mostrarError,
      'aria-describedby': mostrarError ? `${id}-error` : (helperText ? `${id}-helper` : undefined),
    }),
    helperText && !mostrarError
      ? React.createElement('span', { className: 'campo-react-helper', id: `${id}-helper` }, helperText)
      : null,
    mostrarError
      ? React.createElement('span', { className: 'campo-react-error', id: `${id}-error`, role: 'alert' }, error)
      : null
  );
}

// ---------- Componente reutilizable: botón ----------
function Button({ children, disabled, loading, type = 'submit' }) {
  return React.createElement(
    'button',
    { type, className: 'btn-react', disabled: disabled || loading },
    loading ? 'Enviando…' : children
  );
}

// ---------- Componente reutilizable: alerta ----------
function Alert({ tipo, texto }) {
  if (!texto) return null;
  return React.createElement(
    'div',
    { className: `alert-react alert-react--${tipo}`, role: 'status' },
    texto
  );
}

// ---------- Componente principal: formulario de contacto ----------
function ContactoForm() {
  const [valores, setValores] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({ nombre: '', email: '', mensaje: '' });
  const [tocado, setTocado] = useState({ nombre: false, email: false, mensaje: false });
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: '', texto: '' });

  // Validación reactiva: se recalcula cada vez que cambian los valores.
  useEffect(() => {
    setErrores({
      nombre: REGLAS.nombre(valores.nombre),
      email: REGLAS.email(valores.email),
      mensaje: REGLAS.mensaje(valores.mensaje),
    });
  }, [valores]);

  const handleChange = useCallback((campo, valor) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const handleBlur = useCallback((campo) => {
    setTocado((prev) => ({ ...prev, [campo]: true }));
  }, []);

  const formularioValido = !errores.nombre && !errores.email && !errores.mensaje;
  const caracteresRestantes = 500 - valores.mensaje.length;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTocado({ nombre: true, email: true, mensaje: true });

    if (!formularioValido) {
      setFeedback({ tipo: 'error', texto: 'Revisa los campos marcados antes de enviar.' });
      return;
    }

    setEnviando(true);
    setFeedback({ tipo: '', texto: '' });

    // Simulación de envío asíncrono (no hay backend en este proyecto).
    setTimeout(() => {
      setEnviando(false);
      setFeedback({ tipo: 'exito', texto: `Gracias ${valores.nombre.trim()}, pronto te responderemos.` });

      if (typeof window.mostrarAlertaFlotante === 'function') {
        window.mostrarAlertaFlotante('¡Mensaje enviado con éxito!');
      }

      setValores({ nombre: '', email: '', mensaje: '' });
      setTocado({ nombre: false, email: false, mensaje: false });
    }, 600);
  };

  return React.createElement(
    'form',
    { className: 'form-react', onSubmit: handleSubmit, noValidate: true },
    React.createElement(FormField, {
      id: 'nombreContacto',
      label: 'Nombre',
      value: valores.nombre,
      onChange: handleChange,
      onBlur: handleBlur,
      error: errores.nombre,
      touched: tocado.nombre,
      placeholder: 'Tu nombre completo',
    }),
    React.createElement(FormField, {
      id: 'emailContacto',
      label: 'Correo electrónico',
      type: 'email',
      value: valores.email,
      onChange: handleChange,
      onBlur: handleBlur,
      error: errores.email,
      touched: tocado.email,
      placeholder: 'example@dominio.com',
    }),
    React.createElement(FormField, {
      id: 'mensajeContacto',
      label: 'Mensaje',
      as: 'textarea',
      value: valores.mensaje,
      onChange: handleChange,
      onBlur: handleBlur,
      error: errores.mensaje,
      touched: tocado.mensaje,
      placeholder: 'Escribe tu mensaje',
      maxLength: 500,
      helperText: `${caracteresRestantes} caracteres restantes`,
    }),
    React.createElement(Button, { loading: enviando }, 'Enviar mensaje'),
    React.createElement(Alert, { tipo: feedback.tipo, texto: feedback.texto })
  );
}

// ---------- Montaje del módulo React en el DOM existente ----------
document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contactoRoot');
  if (!contenedor) return;

  const root = ReactDOM.createRoot(contenedor);
  root.render(React.createElement(ContactoForm));
});
