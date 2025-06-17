import Link from "next/link";

export default function AccessDenied() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          🚫 Acesso Negado
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Você não tem permissão para acessar esta página. Se você acredita que
          isso é um erro, entre em contato com o administrador.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition duration-300"
        >
          Voltar para o login
        </Link>
      </div>
    </>
  );
}
