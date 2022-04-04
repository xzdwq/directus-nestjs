# Help & Support

> Directus is offered completely free and open-source for anyone wishing to self-host the platform. If you have
> questions along the way, there are many resources, both free and paid, to help you get up-and-running smoothly.

## Troubleshooting Steps

If you're experiencing issues or think you have found a problem in Directus, be sure to follow these steps before
[Reporting a Bug](/contributing/introduction/#bug-reporting):

1. Ensure your server/database meet the
   [minimum requirements](/getting-started/installation/cli/#_1-confirm-minimum-requirements)
2. Ensure you’re on the [latest version of Directus](https://github.com/directus/directus/releases/latest)
3. Stop (`CTRL+C`) and restart the server (`npx directus start`)
4. Run the database migration script: `directus database migrate:latest` (backup your database first)
5. Disable any data-caching within your project
6. Test any App issues with browser extensions and cache disabled (eg: Incognito Mode)
7. Confirm the issue is not related to your own custom code
8. Check for [existing Issues](https://github.com/directus/directus/issues?q=is%3Aissue) (and
   [Discussions](https://github.com/directus/directus/discussions)) that match your problem

::: tip Source Contributors

Those who have installed from source should also remove all dependencies (`npx lerna clean -y`) and then reinstall them
(`npm install`).

:::

If you're still experiencing a problem after completing the above steps, you can chat through things on our
[community support](#community-support) or [report a bug](/contributing/introduction/#bug-reporting).

## Community Support

[Github Discussions](https://github.com/directus/directus/discussions) is great first place to reach out for help. Our
community and core developers often check this platform and answer posts. It has the added benefit of being an archival
resource for others developers with similar questions.

Our [Discord Community](https://directus.chat) is another great way to get assistance. Please keep all questions on the
`#help` channel, be considerate, and remember that you are getting free help from the community for a free product.

## Premium Support

Premium support is included with our Enterprise Cloud service. On-Demand Cloud customers and Self-Hosted users
interested in learning more about our monthly retainer agreements should contact us at
[support@directus.io](mailto:support@directus.io).

## Sponsored Work

### Commissioned Features

If you need a specific feature added to Directus faster than the normal development timeline,
[reach out to us](https://directus.io/contact/) for a quote. Our parent agency will often help subsidize the cost of
developing new features if they pass our [80/20 Rule](/contributing/introduction/#feature-requests) and can be merged
into the core codebase. Other custom/proprietary development will be built bespoke within our robust extension system.

### Expedited Fixes

We triage all reported bugs based on priority and how long the fix is estimated to take. If you need a specific issue
resolved sooner, [reach out to us](https://directus.io/contact/) for a quote.

## Frequently Asked Questions

### Does Directus support Mongo/NoSQL?

Not currently. Directus has been built specifically for wrapping _relational_ databases. While we could force Mongo to
use tables, columns, and rows via Mongoose object modeling, that approach of "faking" a relational structure in a
non-structured environment like Mongo doesn't make a lot of sense. We do realize many users are interested in this
feature, and will continue to explore its possibility.

### Why haven't you added this feature, or fixed that issue yet?

Directus is primarily a free and open-source project, maintained by a small core team and community contributors who
donate their time and resources.

Our platform is feature-rich, however we strictly adhere to our
[80/20 Rule](/contributing/introduction/#feature-requests) to avoid a messy/bloated codebase. Directus is also quite
stable, however new issues still arise, some of which may be triaged with a lower prioritization.

If you require more expeditious updates, you can contact us regarding [sponsoring expedited fixes](#expedited-fixes) or
[commissioning new features](#commissioned-features). You can also
[submit a pull request](https://github.com/directus/directus/pulls) — after all, it is open-source!

### Can you give an ETA for this feature/fix?

If it is sponsored work, then yes, delivery dates are part of our statement of work agreements. Otherwise, most likely
not. This is open-source software, work is prioritized internally, and all timelines are subject to change.

### But this is an emergency, my very important project requires it now!

We understand, and are here to help. If you need something prioritized, you can reach out to us to discuss
[premium support](#premium-support), [sponsoring expedited fixes](#expedited-fixes) or
[commissioning new features](#commissioned-features).
