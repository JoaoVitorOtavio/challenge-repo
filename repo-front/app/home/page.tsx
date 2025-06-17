"use client";

import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAbility } from "@/contexts/AbilityContext";

export default function Home() {
  const ability = useAbility();

  const currentUser = useSelector((state: RootState) => state.user.user);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <header className="bg-blue-500 text-white text-center py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Meu Sistema!</h1>
          <p className="text-lg mb-6">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum
            ullam repudiandae repellendus consectetur laborum impedit eligendi
            veniam quam error debitis illum, neque ad odit necessitatibus. Ad
            incidunt molestiae voluptate. Adipisci?
          </p>
          <a
            href="#"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
          >
            Saiba Mais
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funcionalidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            {ability.can("read", "User") && (
              <div className="flex flex-col items-center justify-between bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-4">
                  Listagem de Usuarios
                </h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Illum quo quae quaerat fugit.
                </p>
                <Link
                  href="/users"
                  className="display: flex items-center justify-center mt-4 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
                >
                  Acessar
                </Link>
              </div>
            )}

            {ability.can("create", "User") && (
              <div className="flex flex-col items-center justify-between bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-4">
                  Criação de Usuario
                </h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab,
                  aliquid? Error sed exercitationem ducimus recusandae? Maiores
                  animi deleniti consequuntur velit reiciendis qui, amet ad
                  quasi culpa, ducimus ex blanditiis. Suscipit!
                </p>
                <Link
                  href="/create/user"
                  className="display: flex items-center justify-center mt-4 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
                >
                  Acessar
                </Link>
              </div>
            )}

            <div className="flex flex-col items-center justify-between bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-4">
                Mudar minhas informações
              </h3>
              <p className="text-gray-600">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Pariatur commodi placeat laborum. Fugit cumque nihil quod
                veritatis ab eum officiis, et repudiandae ipsam ullam eaque
                delectus ut consequuntur maiores magni!
              </p>
              <Link
                href={`/update/user/${currentUser?.id}`}
                className="display: flex items-center justify-center mt-4 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
              >
                Acessar
              </Link>
            </div>

            <div className="flex flex-col items-center justify-between bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold mb-4">Mudar minha senha</h3>
              <p className="text-gray-600">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Laboriosam et dignissimos nulla odit, quam similique ab possimus
                optio officiis laborum minus, enim deserunt expedita vel
                blanditiis doloremque pariatur ipsum fuga?
              </p>
              <Link
                href={`/update/user/${currentUser?.id}/password`}
                className="display: flex items-center justify-center mt-4 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
              >
                Acessar
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
