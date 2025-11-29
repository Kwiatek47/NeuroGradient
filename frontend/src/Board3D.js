import React from 'react';
import { Canvas } from '@react-three/fiber';

function Board() {

  // Tworzenie płaskiej planszy z kwadracikami - większa plansza
  const boardSize = 8; // 8x8 kwadracików (jak na zdjęciu)
  const squareSize = 1.0;
  const spacing = 0.1;
  const totalSize = boardSize * (squareSize + spacing) - spacing;

  // Tworzenie geometrii planszy
  const squares = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      squares.push({
        x: (i - boardSize / 2) * (squareSize + spacing) + squareSize / 2,
        z: (j - boardSize / 2) * (squareSize + spacing) + squareSize / 2,
      });
    }
  }

  const platformHeight = 0.3;
  const platformThickness = 0.1;
  const platformSize = totalSize + 1.0;

  return (
    <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
      {/* Brązowa platforma/podstawa */}
      <mesh position={[0, -platformHeight / 2 - platformThickness, 0]}>
        <boxGeometry args={[platformSize, platformThickness, platformSize]} />
        <meshBasicMaterial color="#8D6E63" />
      </mesh>
      
      {/* Boki platformy */}
      <mesh position={[0, -platformHeight / 2 - platformThickness / 2, platformSize / 2]}>
        <boxGeometry args={[platformSize, platformHeight, platformThickness]} />
        <meshBasicMaterial color="#6D4C41" />
      </mesh>
      <mesh position={[0, -platformHeight / 2 - platformThickness / 2, -platformSize / 2]}>
        <boxGeometry args={[platformSize, platformHeight, platformThickness]} />
        <meshBasicMaterial color="#6D4C41" />
      </mesh>
      <mesh position={[platformSize / 2, -platformHeight / 2 - platformThickness / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[platformSize, platformHeight, platformThickness]} />
        <meshBasicMaterial color="#6D4C41" />
      </mesh>
      <mesh position={[-platformSize / 2, -platformHeight / 2 - platformThickness / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[platformSize, platformHeight, platformThickness]} />
        <meshBasicMaterial color="#6D4C41" />
      </mesh>
      
      {/* Podstawowa płaszczyzna - tło trawy */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalSize + 0.6, totalSize + 0.6]} />
        <meshBasicMaterial color="#8BC34A" />
      </mesh>
      
      {/* Kwadraciki - główna plansza w stylu low-poly */}
      {squares.map((square, index) => {
        // Alternatywne kolory dla efektu szachownicy
        const isEven = (Math.floor(index / boardSize) + (index % boardSize)) % 2 === 0;
        return (
          <mesh
            key={index}
            position={[square.x, 0.01, square.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[squareSize, squareSize]} />
            <meshBasicMaterial 
              color={isEven ? "#C5E1A5" : "#689F38"}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1.0} />
    </>
  );
}

export default function Board3D() {
  return (
    <div className="board-3d-container">
      <Canvas
        camera={{ 
          position: [10, 12, 10], 
          fov: 45,
          up: [0, 1, 0]
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ camera }) => {
          // Ustawienie kamery, aby patrzyła na środek planszy (widok isometryczny)
          camera.lookAt(0, 0, 0);
        }}
      >
        <Lights />
        <Board />
      </Canvas>
    </div>
  );
}

