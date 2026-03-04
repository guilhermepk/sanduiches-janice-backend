import { HttpException, InternalServerErrorException } from '@nestjs/common';

/**
 * Abstrai o uso de try cacth para padronizar a tratativa de erros. Recebe uma função callback e a executa. Em caso de erro, verifica se o erro é uma instância de HttpException e trata de acordo.
 * @param callback A função callback que será executada.
 * @param errorMessage Uma mensagem personalizada a ser exibida em caso de um erro inesperado (não tratado). A mensagem será exibida juntamente com a mensagem do erro.
 * @returns O resultado da execução da função callback.
 *
 * @throws HttpException - Caso alguma regra de negócio seja atentida e estoure um erro previsto e programado.
 * @throws InternalServerErrorException - Caso aconteça algum erro inesperado. Por exemplo, um erro no banco de dados ou um erro de runtime do JavaScript.
 */
export async function tryCatch<CallbackReturnType>(
  callback: () => CallbackReturnType | Promise<CallbackReturnType>,
  errorMessage: string,
): Promise<CallbackReturnType> {
  try {
    return await callback();
  } catch (error) {
    throw handleError(error, errorMessage);
  }
}

/**
 * Trata o erro recebido. Caso seja um erro HTTP (já tratado) o estoura. Caso seja um erro comum (não tratado) o estoura como um erro interno do servidor.
 * @param error O erro a ser tratado.
 * @param alternativeMessage A mensagem que será exibida juntamente a mensagem do erro, caso ele não seja uma instância de um erro HTTP.
 */
function handleError(error: Error, alternativeMessage: string): HttpException | InternalServerErrorException {
  return error instanceof HttpException
    ? error
    : new InternalServerErrorException(
      `${alternativeMessage}. ${error.message}`,
    );
}