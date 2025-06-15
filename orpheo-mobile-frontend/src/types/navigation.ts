import { NavigatorScreenParams } from '@react-navigation/native';
import { Miembro, Documento, Programa } from './index';

// Stack principal de autenticación
export type AuthStackParamList = {
  Login: undefined;
};

// Tab navigator principal
export type MainTabParamList = {
  Dashboard: undefined;
  Miembros: NavigatorScreenParams<MiembrosStackParamList>;
  Documentos: NavigatorScreenParams<DocumentosStackParamList>;
  Programas: NavigatorScreenParams<ProgramasStackParamList>;
  Perfil: undefined;
};

// Stack de miembros
export type MiembrosStackParamList = {
  MiembrosList: undefined;
  MiembroDetail: { miembro: Miembro };
  MiembroForm: { miembro?: Miembro };
};

// Stack de documentos
export type DocumentosStackParamList = {
  DocumentosList: undefined;
  DocumentoDetail: { documento: Documento };
  DocumentoUpload: undefined;
};

// Stack de programas
export type ProgramasStackParamList = {
  ProgramasList: undefined;
  ProgramaDetail: { programa: Programa };
  ProgramaForm: { programa?: Programa };
  Calendario: undefined;
  AsistenciaManager: { programa: Programa };
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen props helpers
export type ScreenProps<
  T extends keyof RootStackParamList | keyof MainTabParamList | keyof MiembrosStackParamList | keyof DocumentosStackParamList | keyof ProgramasStackParamList
> = {
  navigation: any;
  route: {
    params?: T extends keyof RootStackParamList ? RootStackParamList[T] : 
           T extends keyof MainTabParamList ? MainTabParamList[T] :
           T extends keyof MiembrosStackParamList ? MiembrosStackParamList[T] :
           T extends keyof DocumentosStackParamList ? DocumentosStackParamList[T] :
           T extends keyof ProgramasStackParamList ? ProgramasStackParamList[T] : undefined;
  };
};