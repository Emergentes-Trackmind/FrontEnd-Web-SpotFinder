import { CreateSpotRequest } from '../models/spots.models';

/**
 * Utilidades para la generación y manejo de Spots
 */
export class SpotGeneratorHelper {

  /**
   * Convierte un número de columna a su letra correspondiente
   * 1 = A, 2 = B, ..., 26 = Z, 27 = AA, 28 = AB, etc.
   */
  static columnNumberToLetter(columnNumber: number): string {
    let result = '';
    let num = columnNumber;

    while (num > 0) {
      num--; // Hacer que sea base 0
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }

    return result;
  }

  /**
   * Convierte una letra de columna a su número correspondiente
   * A = 1, B = 2, ..., Z = 26, AA = 27, AB = 28, etc.
   */
  static columnLetterToNumber(columnLetter: string): number {
    let result = 0;
    const upperLetter = columnLetter.toUpperCase();

    for (let i = 0; i < upperLetter.length; i++) {
      result = result * 26 + (upperLetter.charCodeAt(i) - 64);
    }

    return result;
  }

  /**
   * FUNCIÓN PRINCIPAL: Genera spots automáticamente con la regla del 5
   *
   * @param totalSpots Número total de plazas a generar
   * @returns Array de objetos CreateSpotRequest listos para el backend
   *
   * Lógica de Negocio:
   * - Máximo 5 filas por columna (constante fija)
   * - Al llegar a 5, saltar a la siguiente columna
   * - Ejemplo con 12 plazas: A1,A2,A3,A4,A5,B1,B2,B3,B4,B5,C1,C2
   */
  static generateAutoSpots(totalSpots: number): CreateSpotRequest[] {
    const MAX_ROWS_PER_COLUMN = 5;
    const spots: CreateSpotRequest[] = [];

    let currentColumn = 1;
    let currentRow = 1;

    for (let i = 0; i < totalSpots; i++) {
      const columnLetter = this.columnNumberToLetter(currentColumn);
      const label = `${columnLetter}${currentRow}`;

      spots.push({
        row: currentRow,
        column: currentColumn,
        label: label
      });

      // Incrementar fila
      currentRow++;

      // Si llegamos al máximo de filas, saltar a la siguiente columna
      if (currentRow > MAX_ROWS_PER_COLUMN) {
        currentColumn++;
        currentRow = 1;
      }
    }

    console.log(`✅ SpotGenerator: Generados ${totalSpots} spots automáticamente`);
    console.log('📊 Distribución por columnas:');

    // Log de distribución para debugging
    const columnDistribution = new Map<number, number>();
    spots.forEach(spot => {
      const count = columnDistribution.get(spot.column) || 0;
      columnDistribution.set(spot.column, count + 1);
    });

    columnDistribution.forEach((count, column) => {
      const letter = this.columnNumberToLetter(column);
      console.log(`   Columna ${letter} (${column}): ${count} spots`);
    });

    return spots;
  }

  /**
   * Crea un spot manual con validación
   *
   * @param columnLetter Letra de la columna (ej: "A", "B", "AA")
   * @param rowNumber Número de la fila (ej: 1, 20, 50)
   * @returns Objeto CreateSpotRequest o null si es inválido
   */
  static createManualSpot(columnLetter: string, rowNumber: number): CreateSpotRequest | null {
    // Validaciones básicas
    if (!columnLetter || columnLetter.trim() === '') {
      console.error('❌ SpotGenerator: Letra de columna no puede estar vacía');
      return null;
    }

    if (rowNumber < 1 || rowNumber > 999) {
      console.error('❌ SpotGenerator: Número de fila debe estar entre 1 y 999');
      return null;
    }

    // Validar que solo contenga letras
    const letterRegex = /^[A-Za-z]+$/;
    if (!letterRegex.test(columnLetter)) {
      console.error('❌ SpotGenerator: La columna solo puede contener letras');
      return null;
    }

    const cleanColumnLetter = columnLetter.toUpperCase().trim();
    const columnNumber = this.columnLetterToNumber(cleanColumnLetter);
    const label = `${cleanColumnLetter}${rowNumber}`;

    console.log(`✅ SpotGenerator: Spot manual creado: ${label} (Columna: ${columnNumber}, Fila: ${rowNumber})`);

    return {
      row: rowNumber,
      column: columnNumber,
      label: label
    };
  }

  /**
   * Valida si un label ya existe en una lista de spots
   *
   * @param label Label a validar (ej: "A1")
   * @param existingSpots Array de spots existentes
   * @returns true si ya existe, false si es único
   */
  static labelExists(label: string, existingSpots: { label: string }[]): boolean {
    return existingSpots.some(spot => spot.label.toLowerCase() === label.toLowerCase());
  }

  /**
   * Obtiene el siguiente spot disponible en una columna
   *
   * @param columnLetter Letra de la columna
   * @param existingSpots Spots existentes
   * @returns Siguiente número de fila disponible
   */
  static getNextAvailableRowInColumn(columnLetter: string, existingSpots: { label: string }[]): number {
    const upperColumnLetter = columnLetter.toUpperCase();
    let row = 1;

    while (this.labelExists(`${upperColumnLetter}${row}`, existingSpots)) {
      row++;
    }

    return row;
  }
}
