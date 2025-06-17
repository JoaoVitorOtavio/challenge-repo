import Footer from "@/app/components/Footer/Footer";
import Navbar from "@/app/components/Navbar/Navbar";
import UserForm from "@/app/components/UserForm/UserForm";

export default function UpdateUser() {
  return (
    <div>
      <Navbar />
      <UserForm isEdit />
      <Footer />
    </div>
  );
}
