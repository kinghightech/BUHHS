import { motion } from "framer-motion";

export default function App() {
    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "black"
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                style={{
                    width: 140,
                    height: 140,
                    background: "white",
                    borderRadius: 20
                }}
            />
        </div>
    );
}