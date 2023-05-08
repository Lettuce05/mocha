type ModalPropTypes = {
  shown: boolean;
  children?: any;
};

export default function Modal({ shown, children }: ModalPropTypes) {
  return (
    <div
      className={`${
        shown ? "block" : "hidden"
      } fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-black bg-black/40`}
    >
      {children}
    </div>
  );
}
