export default async function OrganizationLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: { slug: string }
}) {
    const { slug } = params;
    //   const userProfile = await getUserProfileByToken(); // Tvoja service z predošlých krokov

    //   // Overíme, či má používateľ v zozname svojich organizácií túto so slugom v URL
    //   const hasAccess = userProfile.orgs.some(org => org.slug === slug);

    //   if (!hasAccess && !userProfile.user.isSuperadmin) {
    //     redirect('/unauthorized'); // Alebo ho hoď na jeho defaultOrgSlug
    //   }

    return (
        <div className="flex">
            {/* <Sidebar organizations={userProfile.orgs} currentSlug={slug} /> */}
            <main>{children}</main>
        </div>
    );
}