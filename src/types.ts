export interface ModeloMueble {
    id: number|string;
    nombre: string;
    img: File|string|null;
}

export interface SerieMueble {
    id: string|number;
    serie: string;
    modelos: ModeloMueble[];
}