export default function Footer() {
  return (
    <>
      <section id="contact" className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Entre em Contato</h2>
          <p className="text-lg mb-6">
            Tem dúvidas ou precisa de ajuda? Fale conosco!
          </p>
          <button
            disabled
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
          >
            Enviar E-mail
          </button>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Meu Sistema. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}
