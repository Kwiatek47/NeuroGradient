import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Komponent kamienia w stylu low-poly
function Stone({ position, size = 1 }) {
  const stoneRef = useRef();
  
  // Losowy obrót kamienia
  const rotation = useMemo(() => [
    (Math.random() - 0.5) * 0.3,
    Math.random() * Math.PI * 2,
    (Math.random() - 0.5) * 0.3
  ], []);
  
  const stoneSize = 0.15 * size;
  const stoneHeight = 0.1 * size;
  
  return (
    <group ref={stoneRef} position={[position.x, stoneHeight / 2, position.z]} rotation={rotation}>
      <mesh>
        <dodecahedronGeometry args={[stoneSize, 0]} />
        <meshStandardMaterial color="#757575" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Komponent chmurki w stylu low-poly (biały, geometryczny)
function Cloud({ position, size = 1 }) {
  const cloudRef = useRef();
  
  // Lekka animacja przesuwania chmurki
  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.position.x += Math.sin(state.clock.elapsedTime * 0.1 + position.x) * 0.001;
    }
  });
  
  const cloudSize = 0.8 * size;
  
  return (
    <group ref={cloudRef} position={[position.x, position.y, position.z]}>
      {/* Główna część chmurki - bardziej geometryczna (mniej segmentów dla low-poly) */}
      <mesh position={[0, 0, 0]}>
        <dodecahedronGeometry args={[cloudSize, 0]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.9} transparent flatShading />
      </mesh>
      {/* Dodatkowe geometryczne kształty dla bardziej naturalnego wyglądu */}
      <mesh position={[cloudSize * 0.6, cloudSize * 0.3, 0]}>
        <octahedronGeometry args={[cloudSize * 0.7, 0]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.85} transparent flatShading />
      </mesh>
      <mesh position={[-cloudSize * 0.6, cloudSize * 0.2, 0]}>
        <icosahedronGeometry args={[cloudSize * 0.6, 0]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.85} transparent flatShading />
      </mesh>
      <mesh position={[cloudSize * 0.3, -cloudSize * 0.2, cloudSize * 0.4]}>
        <tetrahedronGeometry args={[cloudSize * 0.5, 0]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent flatShading />
      </mesh>
      <mesh position={[-cloudSize * 0.4, -cloudSize * 0.1, -cloudSize * 0.3]}>
        <dodecahedronGeometry args={[cloudSize * 0.55, 0]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.8} transparent flatShading />
      </mesh>
    </group>
  );
}

// Komponent krzaka w stylu low-poly
function Bush({ position, size = 1 }) {
  const bushRef = useRef();
  
  // Lekka animacja kołysania
  useFrame((state) => {
    if (bushRef.current) {
      bushRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + position.x) * 0.03;
    }
  });
  
  const bushSize = 0.2 * size;
  const bushHeight = 0.15 * size;
  
  return (
    <group ref={bushRef} position={[position.x, bushHeight / 2, position.z]}>
      {/* Główna część krzaka */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[bushSize, 6, 6]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      {/* Dodatkowe małe kulki dla bardziej naturalnego wyglądu */}
      <mesh position={[bushSize * 0.3, 0, bushSize * 0.2]}>
        <sphereGeometry args={[bushSize * 0.6, 6, 6]} />
        <meshStandardMaterial color="#66BB6A" />
      </mesh>
      <mesh position={[-bushSize * 0.3, 0, -bushSize * 0.2]}>
        <sphereGeometry args={[bushSize * 0.7, 6, 6]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[bushSize * 0.2, 0, -bushSize * 0.3]}>
        <sphereGeometry args={[bushSize * 0.5, 6, 6]} />
        <meshStandardMaterial color="#81C784" />
      </mesh>
    </group>
  );
}

// Komponent drzewa w stylu low-poly
function Tree({ position, type = 'normal' }) {
  const groupRef = useRef();
  
  // Lekka animacja kołysania
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  const trunkHeight = 0.8;
  const trunkRadius = 0.08;
  const leavesRadius = 0.6;
  const leavesHeight = 1.2;

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Pień */}
      <mesh position={[0, trunkHeight / 2, 0]}>
        <cylinderGeometry args={[trunkRadius, trunkRadius, trunkHeight, 8]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      
      {/* Liście - warstwa dolna */}
      <mesh position={[0, trunkHeight + leavesHeight * 0.3, 0]}>
        <coneGeometry args={[leavesRadius * 0.9, leavesHeight * 0.5, 8]} />
        <meshStandardMaterial color={type === 'cherry' ? "#FFB3BA" : "#4CAF50"} />
      </mesh>
      
      {/* Liście - warstwa środkowa */}
      <mesh position={[0, trunkHeight + leavesHeight * 0.6, 0]}>
        <coneGeometry args={[leavesRadius * 0.7, leavesHeight * 0.4, 8]} />
        <meshStandardMaterial color={type === 'cherry' ? "#FFCCCB" : "#66BB6A"} />
      </mesh>
      
      {/* Liście - warstwa górna */}
      <mesh position={[0, trunkHeight + leavesHeight * 0.85, 0]}>
        <coneGeometry args={[leavesRadius * 0.5, leavesHeight * 0.3, 8]} />
        <meshStandardMaterial color={type === 'cherry' ? "#FFE4E1" : "#81C784"} />
      </mesh>
      
      {/* Choinka - dodatkowe warstwy */}
      {type === 'christmas' && (
        <>
          <mesh position={[0, trunkHeight + leavesHeight * 0.2, 0]}>
            <coneGeometry args={[leavesRadius, leavesHeight * 0.3, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
          <mesh position={[0, trunkHeight + leavesHeight * 0.95, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Board({ plantedTrees = [], onSquareClick, selectedTreeType, isSpectating = false }) {
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
        row: i,
        col: j,
      });
    }
  }

  const platformHeight = 0.3;
  const platformThickness = 0.1;
  const platformSize = totalSize + 1.0;
  
  // Generuj pozycje dla kamieni i krzaków po całej mapie
  const decorations = useMemo(() => {
    const deco = [];
    const numStones = 20; // Więcej kamieni
    const numBushes = 25; // Więcej krzaków
    
    // Kamienie rozmieszczone po całej mapie
    for (let i = 0; i < numStones; i++) {
      // Losowa pozycja w całym obszarze planszy (również na polach)
      const x = (Math.random() - 0.5) * totalSize * 0.9; // 90% obszaru planszy
      const z = (Math.random() - 0.5) * totalSize * 0.9;
      
      deco.push({ 
        type: 'stone', 
        x, 
        z, 
        size: 0.6 + Math.random() * 0.5 // Różne rozmiary
      });
    }
    
    // Krzaki rozmieszczone po całej mapie
    for (let i = 0; i < numBushes; i++) {
      // Losowa pozycja w całym obszarze planszy (również na polach)
      const x = (Math.random() - 0.5) * totalSize * 0.9; // 90% obszaru planszy
      const z = (Math.random() - 0.5) * totalSize * 0.9;
      
      deco.push({ 
        type: 'bush', 
        x, 
        z, 
        size: 0.5 + Math.random() * 0.7 // Różne rozmiary
      });
    }
    
    return deco;
  }, [totalSize]);

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
      
      {/* Kwadraciki - główna plansza w stylu low-poly z losowymi odcieniami zieleni */}
      {squares.map((square, index) => {
        // Losowe odcienie zieleni (ciemno zielony, zielony, jasno zielony)
        const greenShades = ["#2E7D32", "#388E3C", "#4CAF50", "#66BB6A", "#81C784", "#A5D6A7"];
        // Użyj index do wyboru koloru, aby był deterministyczny dla każdego kwadratu
        const colorIndex = index % greenShades.length;
        const color = greenShades[colorIndex];
        
        // Sprawdź ile drzew jest na tym kwadracie
        const treesOnSquare = plantedTrees.filter(tree => tree.row === square.row && tree.col === square.col);
        const hasTree = treesOnSquare.length > 0;
        
        return (
          <group key={index}>
            <mesh
              position={[square.x, 0.01, square.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (!isSpectating && onSquareClick && selectedTreeType) {
                  onSquareClick(square.row, square.col);
                }
              }}
              onPointerOver={(e) => {
                if (!isSpectating && selectedTreeType) {
                  document.body.style.cursor = 'pointer';
                }
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <planeGeometry args={[squareSize, squareSize]} />
              <meshBasicMaterial 
                color={hasTree ? "#1B5E20" : color}
                opacity={hasTree ? 0.7 : 1}
                transparent
              />
            </mesh>
            {/* Renderuj wszystkie drzewa na tym polu */}
            {treesOnSquare.map((tree, treeIndex) => {
              // Przesunięcie pozycji dla wielu drzew na jednym polu
              const offsetX = (treeIndex % 3 - 1) * 0.15; // -0.15, 0, 0.15
              const offsetZ = (Math.floor(treeIndex / 3) - 1) * 0.15;
              return (
                <Tree 
                  key={tree.id} 
                  position={{ 
                    x: square.x + offsetX, 
                    z: square.z + offsetZ 
                  }} 
                  type={tree?.type || 'normal'} 
                />
              );
            })}
          </group>
        );
      })}
      
      {/* Dekoracje - kamienie i krzaki na brzegach platformy */}
      {decorations.map((deco, index) => (
        <group key={index}>
          {deco.type === 'stone' ? (
            <Stone position={{ x: deco.x, z: deco.z }} size={deco.size} />
          ) : (
            <Bush position={{ x: deco.x, z: deco.z }} size={deco.size} />
          )}
        </group>
      ))}
      
      {/* Chmurki pod platformą - bardzo dużo białych chmur w stylu low-poly */}
      {useMemo(() => {
        const clouds = [];
        const cloudY = -platformHeight - platformThickness - 1.5; // Pozycja pod platformą
        const numClouds = 40; // Bardzo dużo chmur
        
        for (let i = 0; i < numClouds; i++) {
          clouds.push({
            x: (Math.random() - 0.5) * platformSize * 2.5, // Szerszy zakres
            y: cloudY + (Math.random() - 0.5) * 2.0, // Większy zakres wysokości
            z: (Math.random() - 0.5) * platformSize * 2.5, // Szerszy zakres
            size: 0.5 + Math.random() * 1.0 // Różne rozmiary
          });
        }
        return clouds;
      }, [platformSize, platformHeight, platformThickness]).map((cloud, index) => (
        <Cloud 
          key={`cloud-${index}`} 
          position={{ x: cloud.x, y: cloud.y, z: cloud.z }} 
          size={cloud.size} 
        />
      ))}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} />
    </>
  );
}

export default function Board3D({ plantedTrees = [], onSquareClick, selectedTreeType, isSpectating = false }) {
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
        <Board plantedTrees={plantedTrees} onSquareClick={onSquareClick} selectedTreeType={selectedTreeType} isSpectating={isSpectating} />
      </Canvas>
    </div>
  );
}

