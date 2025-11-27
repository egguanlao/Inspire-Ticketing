'use client';

export default function GearLoad() {
  return (
    <>
      <style jsx>{`
        .loader_cogs {
          width: 100px;
          height: 100px;
          position: absolute;
          left: 0;
          right: 0;
          top: -170px;
          bottom: 0;
          margin: auto;
        }

        .COGfirst {
          position: relative;
          width: 100px;
          height: 100px;
          transform-origin: 50px 50px;
          animation: rotate 10s infinite linear;
        }

        .COGfirst div:nth-of-type(1) {
          transform: rotate(30deg);
        }

        .COGfirst div:nth-of-type(2) {
          transform: rotate(60deg);
        }

        .COGfirst div:nth-of-type(3) {
          transform: rotate(90deg);
        }

        .COGfirst .firstPart {
          width: 100px;
          border-radius: 15px;
          position: absolute;
          height: 100px;
          background: rgba(79, 163, 227, 0.8);
          border: 3px solid rgba(79, 163, 227, 1);
          box-shadow: 0 0 8px rgba(79, 163, 227, 0.6), inset 0 0 4px rgba(79, 163, 227, 0.3);
        }

        .COGfirst .firstHole {
          width: 50px;
          height: 50px;
          border-radius: 100%;
          background: rgba(16, 18, 31, 0.95);
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          border: 3px solid rgba(79, 163, 227, 0.8);
          box-shadow: inset 0 0 6px rgba(79, 163, 227, 0.4);
        }

        .COGsecond {
          position: relative;
          width: 80px;
          transform: rotate(16deg);
          top: 28px;
          transform-origin: 40px 40px;
          animation: rotate_left 10s 0.1s infinite reverse linear;
          left: -24px;
          height: 80px;
        }

        .COGsecond div:nth-of-type(1) {
          transform: rotate(30deg);
        }

        .COGsecond div:nth-of-type(2) {
          transform: rotate(60deg);
        }

        .COGsecond div:nth-of-type(3) {
          transform: rotate(90deg);
        }

        .COGsecond .secondPart {
          width: 80px;
          border-radius: 10px;
          position: absolute;
          height: 80px;
          background: rgba(39, 174, 96, 0.8);
          border: 3px solid rgba(39, 174, 96, 1);
          box-shadow: 0 0 8px rgba(39, 174, 96, 0.6), inset 0 0 4px rgba(39, 174, 96, 0.3);
        }

        .COGsecond .secondHole {
          width: 40px;
          height: 40px;
          border-radius: 100%;
          background: rgba(16, 18, 31, 0.95);
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          border: 3px solid rgba(39, 174, 96, 0.8);
          box-shadow: inset 0 0 6px rgba(39, 174, 96, 0.4);
        }

        .COGthird {
          position: relative;
          width: 60px;
          top: -65px;
          transform-origin: 30px 30px;
          animation: rotate_left 10.2s 0.4s infinite linear;
          transform: rotate(4deg);
          left: 79px;
          height: 60px;
        }

        .COGthird div:nth-of-type(1) {
          transform: rotate(30deg);
        }

        .COGthird div:nth-of-type(2) {
          transform: rotate(60deg);
        }

        .COGthird div:nth-of-type(3) {
          transform: rotate(90deg);
        }

        .COGthird .thirdPart {
          width: 60px;
          border-radius: 8px;
          position: absolute;
          height: 60px;
          background: rgba(110, 99, 198, 0.8);
          border: 3px solid rgba(110, 99, 198, 1);
          box-shadow: 0 0 8px rgba(110, 99, 198, 0.6), inset 0 0 4px rgba(110, 99, 198, 0.3);
        }

        .COGthird .thirdHole {
          width: 30px;
          height: 30px;
          border-radius: 100%;
          background: rgba(16, 18, 31, 0.95);
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          border: 3px solid rgba(110, 99, 198, 0.8);
          box-shadow: inset 0 0 6px rgba(110, 99, 198, 0.4);
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate_left {
          from {
            transform: rotate(16deg);
          }
          to {
            transform: rotate(376deg);
          }
        }

        @keyframes rotate_right {
          from {
            transform: rotate(4deg);
          }
          to {
            transform: rotate(364deg);
          }
        }
      `}</style>
      <div className="loader_cogs">
        <div className="COGfirst">
          <div className="firstPart"></div>
          <div className="firstPart"></div>
          <div className="firstPart"></div>
          <div className="firstHole"></div>
        </div>
        <div className="COGsecond">
          <div className="secondPart"></div>
          <div className="secondPart"></div>
          <div className="secondPart"></div>
          <div className="secondHole"></div>
        </div>
        <div className="COGthird">
          <div className="thirdPart"></div>
          <div className="thirdPart"></div>
          <div className="thirdPart"></div>
          <div className="thirdHole"></div>
        </div>
      </div>
    </>
  );
}

