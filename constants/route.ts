import type { Route } from "next"

export type RouteProps = {
	HOME: Route
	SIGN_IN: Route
	SIGN_UP: Route
	SEARCH: Route
	ACTIVITY: Route
	SAVED_POSTS: Route
	SETTINGS: Route
}

export const ROUTE: RouteProps = {
	HOME: "/" as Route,
	SIGN_IN: "/sign-in" as Route,
	SIGN_UP: "/sign-up" as Route,
	SEARCH: "/search" as Route,
	ACTIVITY: "/activity" as Route,
	SAVED_POSTS: "/saved_posts" as Route,
	SETTINGS: "/settings" as Route,
}
