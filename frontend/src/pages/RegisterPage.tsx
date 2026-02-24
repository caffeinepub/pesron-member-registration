import { RegistrationForm } from '../components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Borang Pendaftaran Ahli</h2>
        <p className="text-muted-foreground">
          Sila lengkapkan maklumat di bawah untuk mendaftar sebagai ahli PESRON
        </p>
      </div>
      <RegistrationForm />
    </div>
  );
}
