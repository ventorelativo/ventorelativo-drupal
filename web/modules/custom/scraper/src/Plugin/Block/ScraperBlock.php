<?php

declare(strict_types = 1);

namespace Drupal\scraper\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Http\ClientFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Psr\Http\Client\ClientInterface;
use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DomCrawler\Crawler;

/**
 * Provides a scraper block.
 *
 * @Block(
 *   id = "scraper_scraper",
 *   admin_label = @Translation("Scraper"),
 *   category = @Translation("Scraper"),
 * )
 */
final class ScraperBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs the plugin instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private readonly CacheBackendInterface $cacheStatic,
    private readonly ClientFactory $httpClientFactory,
    private readonly ClientInterface $httpClient,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): self {
    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cache.static'),
      $container->get('http_client_factory'),
      $container->get('http_client'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration(): array {
    return [
      'example' => $this->t('Hello world!'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state): array {
    $form['example'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Example'),
      '#default_value' => $this->configuration['example'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state): void {
    $this->configuration['example'] = $form_state->getValue('example');
  }

  /**
   * {@inheritdoc}
   */
  public function scrape(array $pages): array {
    $xct_user = "ergarro";
    $xct_pass = "@ETde77BMP@HJn8";
    $xct_table_selector = "table.flights";

    $client = new HttpBrowser();
    $tables = [];
    $i = 0;
    foreach ($pages as $key => $page) {
      $crawler = $client->request('GET', $page['url']);

      // Login on the first table.
      if ($i === 0) {
        $form = $crawler->filter('#login')->form([
          'login[username]' => $xct_user,
          'login[password]' => $xct_pass,
        ]);
        $crawler = $client->submit($form);
      }

      $crawler = $crawler->filter($xct_table_selector);

      $tables[$key] = $page;

      $tables[$key]['rows'] = $crawler->filter('tbody tr')->slice(0, 25)->each(function (Crawler $node, $i) {
        $day = preg_replace('@<(\w+)\b.*?>.*?</\1>@si', '', $node->filter('td:nth-child(2) .full')->html());
        $time = $node->filter('td:nth-child(2) .full em')->text('');
        $dateTime = DrupalDateTime::createFromFormat('d.m.y H:i', trim($day) . " " . trim($time));

        return [
          'day' => $day,
          'time' => $time,
          'date_time' => $dateTime->format('Y-m-d\TH:i:s'),
          'name' => $node->filter('td:nth-child(3) a.plt')->text(''),
          'name_link' => $node->filter('td:nth-child(3) a.plt')->link()?->getUri(),
          'launch' => $node->filter('td:nth-child(4) a.lau')->text(''),
          'launch_link' => $node->filter('td:nth-child(4) a.lau')->link()?->getUri(),
          'route' => $node->filter('td:nth-child(5) em')->text(''),
          'length' => $node->filter('td:nth-child(6) strong')->text(''),
          'points' => $node->filter('td:nth-child(7) strong')->text(''),
          'glider_model' => $node->filter('td:nth-child(8) > div')->attr('title', ''),
          'glider_rating' => $node->filter('td:nth-child(8) span:first-child')->text(''),
          'link' => $node->filter('td:nth-child(10) a.detail')->link()->getUri(),
        ];
      });
      $i++;

    }

    return $tables;

  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $xct_url_base = "https://www.xcontest.org/world/en/";
    $xct_url_search = "flights-search/?";
    $xct_url_location = "filter[point]=7.116547+44.903584&filter[radius]=20000&";
    $xct_url_vr = $xct_url_base . $xct_url_search . $xct_url_location;
    $xct_url_recent = $xct_url_vr . "list[sort]=time_start&filter[mode]=START&filter[date_mode]=dmy&filter[date]=&filter[value_mode]=dst&filter[catg]=FAI3";
    $xct_url_daily = $xct_url_vr . "filter[mode]=START&filter[date_mode]=dmy&filter[date]=2023-11-26&filter[value_mode]=dst&filter[catg]=FAI3&list[sort]=pts&list[dir]=down";
    $xct_url_best = $xct_url_vr . "filter[mode]=START&filter[date_mode]=dmy&filter[value_mode]=dst&filter[catg]=FAI3&list[sort]=pts&list[dir]=down";
    $pages = [
      'daily' => [
        'label' => 'Migliori giornata',
        'url' => $xct_url_daily,
      ],
      'best' => [
        'label' => 'Migliori sempre',
        'url' => $xct_url_best,
      ],
      'recent' => [
        'label' => 'Recenti',
        'url' => $xct_url_recent,
      ],
    ];

    return [
      '#theme' => 'xct_tables',
      '#tables' => $this->scrape($pages),
    ];
  }

}
