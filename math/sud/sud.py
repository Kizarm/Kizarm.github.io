#!/usr/bin/env python
# -*- coding: utf-8 -*-
import matplotlib.pyplot as plt
import sympy
template='''<html>
  <head>
    <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=utf-8"></META>
    <title>Barrel</title>
    <style>
      body {{background-color: rgb(192,255,255);}} h2 {{color: rgb(64,0,192); font-size: 24px;}}
      table, th, td {{ border: 1px solid black; border-collapse: collapse; text-align: center; }}
      th, td {{ padding: 10px; }}
      .center {{  display: block;  margin-left: auto;  margin-right: auto;  width: 50%; }}
    </style>
    <script type="text/x-mathjax-config">MathJax.Hub.Config({{
    extensions: ["tex2jax.js"],
    TeX: {{ extensions: ["AMSmath.js"]}},
    jax: ["input/TeX","output/HTML-CSS"],
    tex2jax: {{inlineMath: [['$','$']]}},
    displayAlign: "left"}});
    </script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js">
    </script>
  </head>
  <body>
  <h2>Odvození  vzorce pro objem sudu s eliptickým nebo parabolickým průřezem v ose.</h2>
  <img src="sud.png" class="center">
  <p>Jednoho dne mne soused zaskočil tvrzením, že <b>dodnes</b> není znám vzorec pro výpočet <b>objemu normálního
  dřevěného sudu</b>. Tak jsem pátral po Internetu a opravdu není lehké najít v češtině relevantní data.
  Nicméně tento problém je opravdu starý, počíná zřejmě už Archimedem ale první zmínka o relevantním
  vzorci je spojena se jménem matematika a hvězdáře Johanna Keplera. Kepler koupil sud vína na svatbu
  a způsob měření objemu obchodníka s vínem ho rozhněval. Poté studoval, jak vypočítat plochy a objemy těchto těles
  a napsal o tom knihu (vydanou v roce 1615): „Nova Stereometria doliorum vinariorum“, kde se uvádí
  i formule (vzorce, jak je známe dnes se tehdy ještě nepoužívaly) aproximující sud ořezaným rotačním elipsoidem.
  Tato formule se používá dodnes a je tedy už <b>více jak čtyři století stará</b>.
  </p>
  <p>Po formulaci infinitezimálního počtu Newtonem a Leibnizem byly odvozeny další vzorce, aproximující plášť
  sudu jinými funkcemi, které by lépe odpovídaly realitě. Zde bude použita kromě původní eliptické ještě
  aproximace parabolická, čistě kruhovou, která se zdá nejlepší vynecháme - ne, že by to nešlo, ale výsledný
  vzorec je dost složitý a pro mírné zakřivení sudu není rozdíl mezi jednotlivými vzorci tak velký, aby
  se to nějak významně projevilo v praxi.
  </p>
  <table align="center">
    <tr><td>Aproximace pláště</td><td>Eliptická (Kepler)</td><td>Parabolická</td>
    </tr>
    <tr><td>Funkce F(x,y)</td><td>$ \\frac{{x^2}}{{a^2}} + \\frac{{y^2}}{{b^2}} = 1 $</td><td> $ y = ax^2 + b $ </td>
    </tr>
    <tr style="background-color:#00FF00;font-size:24px;"><td>Výsledný vzorec</td><td>$ {0:s} $</td><td>$ {1:s} $</td>
    </tr>
  </table>
  <h2>Závěr.</h2>
  <p>Podrobnosti odvození jsou ve <a href="sud.py">skriptu</a>, který to umí symbolicky spočítat.
  Celkem nic na tom není - v aproximující funkci $ F(x,y) = 0 $, což je obecné vyjádření řezu sudem v rovině x,y,
  se parametry a,b vyjádří pomocí rozměrů d,D a pak  se integruje element objemu $ dV = S dx, S = \pi y^2 $, tedy
  $ V = \pi \int_{{-L/2}}^{{+L/2}} y^2 dx $. Sud má rotační symetrii podle osy x, dále pak zrcadlovou symetrii podle roviny y,z.
  Z toho plyne, že pokud vyjádříme y = f(x), pak bude tato funkce vždy sudá. Pro aproximaci se tedy dá použít libovolný sudý polynom,
  ale třeba i funkce cos(x). I to se někdy používá v praxi, ale uvedené dva vzorce stačí, sud stejně nikdy nemá nějaký zcela přesný matematický tvar.
  Podstatné je, že používané aproximační funkce, resp. jejich kvadrát lze analyticky integrovat, tedy lze nalézt primitivní funkci
  v uzavřeném tvaru. Platí to i pro tu aproximaci kružnicí, jen zůstane pod integrálem druhá odmocnina a tím je dána ta složitost.
  Celou práci odvádí knihovna <a href="https://www.sympy.org/en/index.html">sympy</a>, která umí nejen upravovat symbolické
  výrazy, ale i řešit rovnice, derivovat a integrovat. Ruční výpočet je více náchylný na zanesení chyby.
  </p>
  </body>
</html>
'''
def write_html(E,P):
  f = open ('index.html','w')
  f.write(template.format(E,P))
  f.close()
desc = '''
  Odvození vzorce pro objem sudu s eliptickým nebo parabolickým průřezem v ose
  L = výška, D = maximální průměr (v prostředku), d = počáteční průměr (na kraji)
'''
fmt_str = 'Po dozazení {0:s} : V = {1:.2f} litrů'
def to_str (Z):
  s = ''
  for z in Z:
    s += '{0:s} = {1:g}, '.format(z[0], z[1])
  return s[:-2]
def plot_formulas (lat):
  #add text
  y = 0.8
  plt.rcParams['figure.figsize'] = (8,4)
  plt.axis('off')
  for l in lat:
    plt.text(0.01, y, '${0:s}$'.format(l), fontsize = 36)
    y -= 0.3
  #plt.show()
  plt.savefig('img.png')
  plt.close()
def parabolic (DIM):
  print ('\n\tPARABOLIC :')
  x,pi,a,b,d,D,L,V = sympy.symbols('x pi a b d D L V')
  y  = a * x**2 + b    # obecná parabola - hledáme její parametry a,b
  print ('aproximace : y = {0:s}'.format(str(y)))
  e1 = sympy.Eq(y.subs(x, 0), D / 2)      # uprostřed
  e2 = sympy.Eq(y.subs(x, L / 2), d / 2)  # na kraji
  ab = sympy.solve ([e1,e2], [a,b])
  print ('z rozměrů  : {0:s}'.format(str(ab)))
  # provedeme substituce
  y = y.subs (ab)
  print (' dosazeno  : y = {0:s}'.format(str(y)))
  # zintegrujeme
  O = pi * sympy.integrate (y**2, x)
  # v mezích <-L/2,+L/2>
  O = O.subs(x, +L/2) - O.subs(x, -L/2)
  O = sympy.simplify(O)
  e = sympy.Eq (V, O)
  print (' Výsledek  : {0:s}'.format(str(e))) # a máme výsledek
  # Takto lze dosadit čísla
  M = zip ([pi, D, d, L], DIM)
  N = O.subs (M)
  print (fmt_str.format(to_str(M), 1000.0 * N))
  P = sympy.latex(e)
  return P,N
def elliptic(DIM):
  print ('\n\tELLIPTIC (KEPLER FORMULA):')
  x,y,z,pi,a,b,d,D,L,V = sympy.symbols('x y z pi a b d D L V')
  e0 = sympy.Eq (x**2/a**2 + y**2/b**2, 1)  # obecná elipsa
  print ('aproximace : {0:s}'.format(str(e0)))
  # úpravy uděláme postupným dosazováním a řešením příslušných rovnic
  e1 = e0.subs(zip([x,y],[0, D/2]))    # uprostřed
  e2 = e0.subs(zip([x,y],[L/2, d/2]))  # na kraji
  ab = sympy.solve ([e1,e2], a, b)
  e0 = e0.subs (zip ([a,b], list(ab[0])))
  zx = sympy.solve(e0, y**2)
  O = pi * sympy.integrate (zx[0], x)
  # v mezích <-L/2,+L/2>
  O = O.subs(x, +L/2) - O.subs(x, -L/2)
  O = sympy.simplify(O)
  e = sympy.Eq (V, O)
  print (' Výsledek  : {0:s}'.format(str(e))) # a máme výsledek
  # Takto lze dosadit čísla
  M = zip ([pi, D, d, L], DIM)
  N = O.subs (M)
  print (fmt_str.format(to_str(M), 1000.0 * N))
  P = sympy.latex(e)
  return P,N
def finish (V1, V2):
  d = (V1 - V2)
  a = (V1 + V2) / 2.0
  e = 100.0 * d / a
  print ('\n Závěr:\n\tPro cca {0:.0f} litrový sud s malým zakřivením (~10%) je rozdíl mezi oběma vzorci {1:.3f} %'.format(a * 1000.0 ,e))
if __name__ == '__main__':
  print (desc)
  R = [3.14159, 0.63, 0.57, 0.81]
  E,V1 = elliptic  (R)
  P,V2 = parabolic (R)
  finish (V1, V2)
  # plot_formulas([E,P])
  write_html(E,P)
