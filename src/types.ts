export interface ModeloMueble {
    id: number;
    nombre: string;
    img: File|string|null;
}

export interface SerieMueble {
    id: number;
    serie: string;
    modelos: ModeloMueble[];
}