import React from 'react';
import { BridgeList } from '@pubflow/react-native';
import BridgeListMonitor from './BridgeListMonitor';
import { logApiRequest, logApiResponse, logApiError } from '../../utils/bridgeDebug';
import { getDebugConfig } from '../../utils/debugConfig';

/**
 * HOC para envolver BridgeList con capacidades de depuración
 *
 * @param WrappedComponent Componente a envolver (BridgeList)
 * @returns Componente envuelto con capacidades de depuración
 */
export function withBridgeDebug(WrappedComponent: typeof BridgeList) {
  return function DebuggedBridgeList(props: any) {
    // Extraer entityConfig y otros parámetros relevantes
    const { entityConfig, ...restProps } = props;

    // Construir parámetros de búsqueda
    const searchParams = {
      page: props.page || 1,
      limit: props.limit || 10,
      orderBy: props.orderBy,
      orderDir: props.orderDir,
      q: props.searchTerm,
      filters: props.filters
    };

    // Verificar si el debug está habilitado
    const { enabled } = getDebugConfig();

    // Si el debug no está habilitado, devolver el componente original
    if (!enabled) {
      return <WrappedComponent {...props} />;
    }

    // Interceptar props para agregar funcionalidad de depuración
    const interceptedProps = {
      ...props,

      // Interceptar onSuccess para registrar respuestas
      onSuccess: (type: string, data: any) => {
        // Construir URL base
        const basePath = entityConfig.basePath || '/bridge';
        const baseEndpoint = `${basePath}/${entityConfig.endpoint}`;

        // Registrar respuesta
        logApiResponse(baseEndpoint, { type, data });

        // Llamar al onSuccess original si existe
        if (props.onSuccess) {
          props.onSuccess(type, data);
        }
      },

      // Interceptar onError para registrar errores
      onError: (type: string, error: any) => {
        // Construir URL base
        const basePath = entityConfig.basePath || '/bridge';
        const baseEndpoint = `${basePath}/${entityConfig.endpoint}`;

        // Registrar error
        logApiError(baseEndpoint, { type, error });

        // Llamar al onError original si existe
        if (props.onError) {
          props.onError(type, error);
        }
      }
    };

    // Registrar solicitud inicial
    const basePath = entityConfig.basePath || '/bridge';
    const baseEndpoint = `${basePath}/${entityConfig.endpoint}`;
    logApiRequest(baseEndpoint, searchParams);

    // Devolver el componente envuelto en el monitor
    return (
      <BridgeListMonitor
        entityConfig={entityConfig}
        searchParams={searchParams}
      >
        <WrappedComponent {...interceptedProps} />
      </BridgeListMonitor>
    );
  };
}

/**
 * BridgeList con capacidades de depuración
 */
export const DebuggableBridgeList = withBridgeDebug(BridgeList);

export default DebuggableBridgeList;
