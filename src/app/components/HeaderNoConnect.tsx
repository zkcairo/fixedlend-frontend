"use client";
import useTheme from "../hooks/useTheme";
import screen from "../../../public/screen.png";
import "./app.css"


const HeaderNoConnect = () => {

  const { theme, changeTheme } = useTheme();

  return (
    <>

        <title>FixedLend</title>
        <meta name="description" content="FixedLend is p2p lending platform where sophisticated borrowers compete to offer the best yield for passive lenders." />

        {/* Open Graph metadata */}
        <meta property="og:title" content="FixedLend" />
        <meta property="og:description" content="FixedLend is p2p lending platform where sophisticated borrowers compete to offer the best yield for passive lenders." />
        <meta property="og:image" content="https://FixedLend.com/image.png" />
        <meta property="og:url" content="https://FixedLend.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card metadata */}
        <meta name="twitter:card" content="https://FixedLend.com/image.png" />
        <meta name="twitter:title" content="FixedLend" />
        <meta name="twitter:description" content="FixedLend is p2p lending platform where sophisticated borrowers compete to offer the best yield for passive lenders." />
        <meta name="twitter:image" content="https://FixedLend.com/image.png" />
        <meta name="twitter:url" content="https://FixedLend.com" />

      <header
        className="w-full fixed backdrop-blur-2xl dark:border-neutral-800 lg:bg-gray-200 lg:dark:bg-zinc-800/50 left-0 top-0  z-10 flex flex-wrap gap-4 py-2 px-4 md:py-4 md:px-10  justify-between items-center"
      >
        <a href="/">
          <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 40"
            width="200"
            height="40"
            className="md:text-[1.2em]"
          >
            <text
              x="10"
              y="30"
              fontFamily="Cursive, sans-serif"
              fill={`${theme === "dark" ? "white" : "black"}`}
            >
              FixedLend
            </text>
          </svg>
          </span>
        </a>

      </header>
    </>
  );
};

export default HeaderNoConnect;
