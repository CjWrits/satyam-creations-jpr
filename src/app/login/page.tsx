import LoginForm from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = resolvedSearchParams?.callbackUrl || '/';

  return (
    <main className="min-h-screen flex items-center justify-center bg-beige p-4 relative overflow-hidden select-none">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gold/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-maroon/5 rounded-full blur-[120px]" />
        
        {/* Elegant geometric line patterns using pure SVG */}
        <svg className="absolute w-full h-full stroke-gold/10 stroke-[0.5] fill-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="30" />
          <path d="M 10 50 L 90 50 M 50 10 L 50 90" />
        </svg>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
