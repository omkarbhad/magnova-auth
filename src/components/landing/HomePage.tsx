import { Link } from 'react-router-dom';
import { ArrowRight, UserIcon, Settings, Zap, DollarSign, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from './global/container';
import { Wrapper } from './global/wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Marquee from './ui/marquee';
import { StarsBackground, CosmicOrbs } from './ui/stars-background';
import { features, perks, pricingCards, reviews } from './constants';

const HomePage = () => {
    const firstRow = reviews.slice(0, reviews.length / 2);
    const secondRow = reviews.slice(reviews.length / 2);

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <Header />
            
            <section className="w-full relative flex items-center justify-center flex-col px-4 sm:px-6 md:px-8 py-8 sm:py-10 lg:py-12 min-h-screen">
                {/* Cosmic Background */}
                <StarsBackground />
                <CosmicOrbs />
                
                {/* Main gradient overlay - Premium Linkify style */}
                <div className="fixed inset-0 bg-black -z-20" />
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.15),transparent)] -z-10" />
                
                {/* Subtle cosmic glow orbs - Premium Linkify style - At the very back */}
                <div className="fixed inset-0 pointer-events-none -z-30">
                    <div className="absolute top-[40%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow" />
                    <div className="absolute top-[30%] left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-[50%] right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute top-[70%] left-1/3 w-80 h-80 bg-purple-600/8 rounded-full blur-[110px] animate-pulse" />
                </div>

                {/* hero */}
                <Wrapper>
                    <Container>
                        <div className="flex flex-col items-center justify-center py-10 sm:py-14 md:py-16 lg:py-20 h-full relative">
                            <div className="flex flex-col items-center max-w-3xl w-full">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-center leading-tight tracking-tight">
                                    <span className="bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent">Discover Your Cosmic Destiny</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">with Ancient Vedic Wisdom</span>
                                </h1>
                                <p className="text-neutral-400 mt-4 sm:mt-6 text-center text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                                    Generate accurate kundali birth charts and unlock insights into your life's journey.
                                </p>
                                <div className="flex flex-row items-center justify-center mt-8 sm:mt-10 gap-4">
                                    <Link to="/register">
                                        <Button className="h-10 px-6 bg-white text-black font-medium hover:bg-neutral-200 transition-colors">
                                            Get Started
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button className="h-10 px-6 bg-transparent border border-neutral-700 text-white font-medium hover:bg-neutral-800 hover:border-neutral-600 transition-all">
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="relative flex items-center py-12 sm:py-16 md:py-20 w-full">
                                {/* Glow underneath the image - Linkify style */}
                                <div className="absolute top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow" />
                                <div className="absolute top-1/2 left-1/2 -z-10 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600/5 to-blue-600/5 rounded-full blur-[150px]" />
                                <div className="relative group w-full max-w-5xl mx-auto">
                                    <div className="-m-2 rounded-lg p-2 ring-1 ring-inset ring-neutral-800 lg:-m-4 lg:rounded-xl bg-opacity-50 backdrop-blur-3xl">
                                        <div 
                                            style={{
                                                "--size": 80,
                                                "--duration": 12,
                                                "--anchor": 90,
                                                "--border-width": 2,
                                                "--color-from": "#a855f7",
                                                "--color-to": "#3b82f6",
                                                "--delay": "-9s"
                                            } as React.CSSProperties}
                                            className="absolute inset-[0] rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:content-[''] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:[animation:border-beam_calc(var(--duration)*1s)_infinite_linear] after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]"
                                        ></div>
                                        <div className="relative rounded-lg overflow-hidden">
                                            <img
                                                src="/image1.png"
                                                alt="Your Kundali Chart Will Appear Here"
                                                className="w-full h-auto object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-black z-40"></div>
                                        <div className="absolute bottom-0 md:-bottom-8 inset-x-0 w-full h-1/4 bg-gradient-to-t from-black z-50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Wrapper>

                {/* how it works */}
                <Wrapper className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 relative">
                    <Container>
                        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-violet-700 to-violet-900 border border-violet-600 opacity-70">
                                    <Settings className="w-3 h-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Process</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                                    Get your kundali in minutes
                                </h2>
                            </div>
                            <p className="text-neutral-400 mt-4 text-sm max-w-md mx-auto leading-relaxed">
                                Enter your birth details, generate your chart, and explore your insights.
                            </p>
                        </div>
                    </Container>
                    <Container>
                        <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-4 sm:gap-6">
                            {perks.map((perk, index) => (
                                <Card key={perk.title} className="group bg-neutral-950/50 border border-neutral-800/50 hover:border-neutral-700/80 hover:bg-neutral-900/50 transition-all duration-200">
                                    <CardHeader className="pb-2">
                                        <div className="flex flex-col items-start gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                                                <perk.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-neutral-600">0{index + 1}</span>
                                                <CardTitle className="text-sm font-medium text-white">{perk.title}</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <CardDescription className="text-sm text-neutral-500 leading-relaxed">
                                            {perk.info}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </Container>
                </Wrapper>

                {/* features */}
                <Wrapper id="features" className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.05),transparent)] -z-10" />
                    <Container>
                        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-violet-700 to-violet-900 border border-violet-600 opacity-70">
                                    <Zap className="w-3 h-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Features</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                                    Powerful features for you
                                </h2>
                            </div>
                            <p className="text-neutral-400 mt-4 text-sm max-w-md mx-auto leading-relaxed">
                                Everything you need for accurate kundali charts
                            </p>
                        </div>
                    </Container>
                    <Container>
                        <div className="grid grid-cols-2 sm:grid-cols-3 w-full gap-3 sm:gap-4 md:gap-6">
                            {features.map((feature) => (
                                <Card key={feature.title} className="group bg-neutral-950/50 border border-neutral-800/50 hover:border-neutral-700/80 hover:bg-neutral-900/50 transition-all duration-200">
                                    <CardHeader className="pb-2">
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 transition-colors">
                                                <feature.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <CardTitle className="text-sm font-medium text-white group-hover:text-white transition-colors">{feature.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 text-center">
                                        <CardDescription className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
                                            {feature.info}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </Container>
                </Wrapper>

                {/* pricing */}
                <Wrapper id="pricing" className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 relative">
                    <Container>
                        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-violet-700 to-violet-900 border border-violet-600 opacity-70">
                                    <DollarSign className="w-3 h-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Pricing</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                                    Simple, transparent pricing
                                </h2>
                            </div>
                            <p className="text-neutral-400 mt-4 text-sm max-w-md mx-auto leading-relaxed">
                                Choose the best plan for your journey
                            </p>
                        </div>
                    </Container>
                    <Container className="flex items-center justify-center">
                        <div className="flex flex-row gap-4 sm:gap-6 w-full max-w-3xl items-center justify-center">
                            {pricingCards.slice(0, 2).map((card) => (
                                <Card key={card.title} className={cn(
                                    "group bg-neutral-950/50 relative overflow-visible border border-neutral-800/50 hover:border-neutral-700/80 hover:bg-neutral-900/50 transition-all duration-200 flex flex-col w-full sm:w-72",
                                    card.title === "Premium" && "border-neutral-700/80 bg-neutral-900/50"
                                )}>
                                    {card.title === "Premium" && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="text-[10px] font-medium bg-white text-black px-3 py-1 rounded-full">Popular</span>
                                        </div>
                                    )}
                                    <CardHeader className={cn("text-center pt-4 sm:pt-5", card.title === "Premium" && "pt-6 sm:pt-7")}>
                                        <CardTitle className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{card.title}</CardTitle>
                                        <div className="mt-3">
                                            <span className="text-3xl sm:text-4xl font-semibold text-white">{card.price}</span>
                                            {card.duration && <span className="text-sm text-neutral-500">/{card.duration}</span>}
                                        </div>
                                        <CardDescription className="mt-2 text-sm text-neutral-500">{card.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1">
                                        <div className="space-y-3">
                                            {card.features.map((feature) => (
                                                <div key={feature} className="flex items-center gap-3">
                                                    <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-sm text-neutral-400">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4">
                                        <Button 
                                            className={cn(
                                                "w-full h-10 text-sm font-medium transition-all duration-200",
                                                card.title === "Premium" 
                                                    ? "bg-white text-black hover:bg-neutral-200" 
                                                    : "bg-transparent border border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600"
                                            )}
                                        >
                                            {card.buttonText}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </Container>
                </Wrapper>

                {/* testimonials */}
                <Wrapper id="testimonials" className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 relative">
                    <Container>
                        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-violet-700 to-violet-900 border border-violet-600 opacity-70">
                                    <MessageSquare className="w-3 h-3 text-white mr-1" />
                                    <span className="text-xs font-medium text-white">Testimonials</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                                    What people are saying
                                </h2>
                            </div>
                            <p className="text-neutral-400 mt-4 text-sm max-w-md mx-auto leading-relaxed">
                                See how Astrova helps astrology enthusiasts
                            </p>
                        </div>
                    </Container>
                    <Container>
                        <div className="w-full">
                            <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden py-4">
                                <div className="flex items-start justify-start w-full mb-4">
                                    <Marquee reverse pauseOnHover className="[--duration:30s] select-none">
                                        {firstRow.map((review) => (
                                            <Card key={review.name} className="w-72 sm:w-80 mx-2 bg-neutral-950/50 border border-neutral-800/50 hover:border-neutral-700/80 hover:bg-neutral-900/50 transition-all duration-200">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                                            <UserIcon className="w-4 h-4 text-neutral-500" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-sm font-medium text-white">{review.name}</CardTitle>
                                                            <CardDescription className="text-xs text-neutral-500">{review.username}</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-neutral-400 leading-relaxed">"{review.body}"</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Marquee>
                                </div>
                                <div className="flex items-start justify-start w-full">
                                    <Marquee pauseOnHover className="[--duration:30s] select-none">
                                        {secondRow.map((review) => (
                                            <Card key={review.name} className="w-72 sm:w-80 mx-2 bg-neutral-950/50 border border-neutral-800/50 hover:border-neutral-700/80 hover:bg-neutral-900/50 transition-all duration-200">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                                            <UserIcon className="w-4 h-4 text-neutral-500" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-sm font-medium text-white">{review.name}</CardTitle>
                                                            <CardDescription className="text-xs text-neutral-500">{review.username}</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-neutral-400 leading-relaxed">"{review.body}"</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Marquee>
                                </div>
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-black"></div>
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black"></div>
                            </div>
                        </div>
                    </Container>
                </Wrapper>

                {/* CTA Section */}
                <Wrapper className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(120,119,198,0.15),transparent)] -z-10" />
                    <Container>
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight leading-tight">
                                Ready to discover your<br />
                                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">cosmic destiny?</span>
                            </h2>
                            <p className="text-muted-foreground mt-4 sm:mt-6 text-base sm:text-lg max-w-lg mx-auto">
                                Generate accurate kundali charts and unlock insights into your life's journey
                            </p>
                            <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                                <Link to="/chart">
                                    <Button size="lg" className="h-10 sm:h-11 px-6 sm:px-8">
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="h-10 sm:h-11 px-6 sm:px-8">
                                    Contact Sales
                                </Button>
                            </div>
                        </div>
                    </Container>
                </Wrapper>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

// Header component (exact copy from homepage)
function Header() {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${
            scrolled 
                ? 'bg-black/90 backdrop-blur-xl shadow-lg opacity-100' 
                : 'bg-transparent opacity-100'
        }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo/Title */}
                    <Link to="/" className="flex items-center gap-2">
                        <img 
                            src="/astrova_logo.png" 
                            alt="Astrova Logo" 
                            className="w-7 h-7 transition-opacity duration-500"
                        />
                        <span className={`text-sm font-semibold transition-all duration-500 ${
                            scrolled ? 'text-white opacity-100' : 'text-white opacity-90'
                        }`}>Astrova</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#features" className={`text-sm transition-all duration-500 ${
                            scrolled ? 'text-neutral-400 hover:text-white opacity-100' : 'text-neutral-300 hover:text-white opacity-80'
                        }`}>
                            Features
                        </a>
                        <a href="#pricing" className={`text-sm transition-all duration-500 ${
                            scrolled ? 'text-neutral-400 hover:text-white opacity-100' : 'text-neutral-300 hover:text-white opacity-80'
                        }`}>
                            Pricing
                        </a>
                        <a href="#testimonials" className={`text-sm transition-all duration-500 ${
                            scrolled ? 'text-neutral-400 hover:text-white opacity-100' : 'text-neutral-300 hover:text-white opacity-80'
                        }`}>
                            Testimonials
                        </a>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className={`transition-all duration-500 h-8 px-3 text-sm ${
                                scrolled 
                                    ? 'text-neutral-400 hover:text-white hover:bg-white/5 opacity-100' 
                                    : 'text-neutral-300 hover:text-white hover:bg-white/10 opacity-90'
                            }`}>
                                Log in
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white h-8 px-4 text-sm font-medium rounded-lg transition-all duration-500 opacity-100">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Footer component (exact copy from homepage)
function Footer() {
    return (
        <footer className="border-t border-neutral-800 bg-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/astrova_logo.png" alt="Astrova" className="w-6 h-6" />
                            <span className="text-sm font-semibold text-white">Astrova</span>
                        </Link>
                        <p className="text-sm text-neutral-500 mt-4 max-w-xs">
                            Generate accurate kundali charts with modern Vedic astrology calculations.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-white mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><a href="#features" className="text-sm text-neutral-400 hover:text-white transition-colors">Features</a></li>
                            <li><a href="#pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Changelog</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Docs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-white mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-white mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Terms</a></li>
                            <li><a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-neutral-500">
                        © {new Date().getFullYear()} Astrova. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </a>
                        <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

import React from 'react';

export default HomePage;
