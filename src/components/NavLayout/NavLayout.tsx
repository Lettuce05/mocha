import Nav from "../Nav/Nav";

type NavLayoutType = {
  children?: any;
};

export default function NavLayout({ children }: NavLayoutType) {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-100">
      <Nav />
      {children}
    </div>
  );
}
