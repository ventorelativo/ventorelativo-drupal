<?php

declare(strict_types = 1);

namespace Drupal\scraper\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Http\ClientFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Session\AccountInterface;
use Psr\Http\Client\ClientInterface;
use Symfony\Component\BrowserKit\HttpBrowser;
use Symfony\Component\DependencyInjection\ContainerInterface;

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
  public function scrape(): string {
    $xct_url_base = "https://www.xcontest.org/world/en/";
    $xct_url_recent = $xct_url_base . "flights-search/?list[sort]=time_start&filter[point]=7.164612%2044.898234&filter[radius]=18719&filter[mode]=START&filter[date_mode]=dmy&filter[date]=&filter[value_mode]=dst&filter[min_value_dst]=&filter[catg]=FAI3&filter[route_types]=&filter[avg]=&filter[pilot]=";
    $xct_user = "ergarro";
    $xct_pass = "@ETde77BMP@HJn8";
    $xct_table_selector = "table.flights";

    $client = new HttpBrowser();
    $crawler = $client->request('GET', $xct_url_recent);
    $form = $crawler->filter('#login')->form([
      'login[username]' => $xct_user,
      'login[password]' => $xct_pass,
    ]);
    $crawler = $client->submit($form);
    $crawler = $crawler->filter($xct_table_selector);

    return $crawler->outerHtml() ?: 'No scraped content.';
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    $build['content'] = [
      '#markup' => $this->scrape(),
    ];
    $build['#attached']['library'][] = 'scraper/xct-tables';

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account): AccessResult {
    // @todo Evaluate the access condition here.
    return AccessResult::allowedIf(TRUE);
  }

}
