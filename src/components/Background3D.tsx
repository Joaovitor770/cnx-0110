import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, MeshDistortMaterial } from '@react-three/drei';

const AnimatedSphere = () => {
    const sphereRef = useRef<any>(null);

    useFrame(({ clock }) => {
        if (sphereRef.current) {
            sphereRef.current.rotation.z = clock.getElapsedTime() * 0.05;
            sphereRef.current.rotation.x = clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <Sphere visible args={[1, 100, 200]} scale={2.5} ref={sphereRef}>
            <MeshDistortMaterial
                color="#1a1a1a"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
};

const Background3D = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4f46e5" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <AnimatedSphere />
            </Canvas>
        </div>
    );
};

export default Background3D;
