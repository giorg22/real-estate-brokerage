export default function Layout({
  children,
  modal // This MUST be here
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal} {/* This is where the (.)[id] page gets injected */}
    </>
  );
}