// Global type declarations for assets and modules

declare module "*.png" {
    const src: string
    export default src
}

declare module "*.jpg" {
    const src: string
    export default src
}

declare module "*.jpeg" {
    const src: string
    export default src
}

declare module "*.gif" {
    const src: string
    export default src
}

declare module "*.webp" {
    const src: string
    export default src
}

declare module "*.svg" {
    const src: string
    export default src
}

declare module "*.ico" {
    const src: string
    export default src
}

// Specific declarations for the problematic imports
declare module "@app/icon.png" {
    const src: string
    export default src
}

declare module "@assets/images/down-right-arrow.svg" {
    const src: string
    export default src
}

// Extend the global Window interface if needed
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext
    }
}

// CSS modules
declare module "*.module.css" {
    const classes: { [key: string]: string }
    export default classes
}

declare module "*.module.scss" {
    const classes: { [key: string]: string }
    export default classes
} 