"use client";
import { MouseEvent, ReactNode } from "react";

const GenericModal = ({
  isOpen,
  onClose,
  animate,
  children,
  className,
  position,
}: {
  isOpen: boolean;
  onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
  animate: boolean;
  children: ReactNode;
  className?: string;
  position?: string;
}) => {
  return (
    <>
      {isOpen && (
        <section
          onClick={onClose}
          className={`fixed h-screen w-screen grid top-0 left-0 z-[99] backdrop-blur-sm ${
            position ? position : "justify-center items-center"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex flex-col bg-black/80 border border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5),inset_0_0_15px_rgba(0,255,0,0.3)] transition-[opacity,transform] duration-500 ease-in-out ${
              animate
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            } ${className}`}
          >
            {children}
          </div>
        </section>
      )}
    </>
  );
};

export default GenericModal;