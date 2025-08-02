import flexiyoLogo from "/logo192.png"

const LoadingScreen = () => {
  const width = window.innerWidth;

  return (
    <div className="flex items-center h-screen bg-body-bg dark:bg-body-bg-dark text-black dark:text-white justify-center">
      <div className="flex flex-col items-center justify-between h-8/12">
        <img
          src={flexiyoLogo}
          alt="Loading"
          className="w-auto h-30"
          style={{ width: width, objectFit: "contain" }}
        />
        <p className="text-center text-xl">
          <span>Developed with ❤️</span>
          <br />
          <span>by Kaushal</span>
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
