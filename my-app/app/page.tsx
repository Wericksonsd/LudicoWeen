import Login from "./(auth)/login/page";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 text-zinc-100">
      <Login />
    </div>
  );
}
