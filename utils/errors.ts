
export class AppError extends Error {
  constructor(public message: string, public code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Erro de conexão. Verifique sua internet.') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Muitas requisições. Aguarde um momento.') {
    super(message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class FileProcessingError extends AppError {
  constructor(fileName: string, originalError?: any) {
    super(`Erro ao processar o arquivo: ${fileName}`, 'FILE_PROCESSING_ERROR');
    this.name = 'FileProcessingError';
  }
}
