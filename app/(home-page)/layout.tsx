export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{/* <Suspense> */}
			{/* 	<LoadingScreen /> */}
			{/* </Suspense> */}
			<main>{children}</main>
		</>
	)
}
