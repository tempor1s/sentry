import { Context } from '../interfaces/context.interface';
import { AuthChecker } from 'type-graphql';

// TODO: Implement roles for more granular auth (can be used for mod/admin/manager etc for dashboard managment :))
export const customAuthChecker: AuthChecker<Context> = (
  { context },
  _roles
) => {
  const user = context.getUser();
  if (!user) return false;

  return true;
};
